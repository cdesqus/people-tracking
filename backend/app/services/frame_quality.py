"""Low-cost quality checks for decoded camera frames."""

import cv2


def _normalized_correlation(first, second) -> float:
    """Return brightness-independent similarity for two grayscale images."""
    first_float = first.astype("float32")
    second_float = second.astype("float32")
    first_float -= float(first_float.mean())
    second_float -= float(second_float.mean())
    denominator = float(
        cv2.norm(first_float, cv2.NORM_L2)
        * cv2.norm(second_float, cv2.NORM_L2)
    )
    if denominator < 1e-6:
        return 0.0
    return float((first_float * second_float).sum() / denominator)


def has_slicing_artifact(frame) -> bool:
    """
    Detect repeated vertical tiles produced by a desynchronised video decoder.

    A damaged frame commonly contains two or three time-shifted copies of the
    same scene in its upper region, so raw pixel-difference checks miss it when
    people are moving.
    """
    if frame is None or frame.ndim != 3:
        return True

    try:
        # The camera worker passes its existing 160x90 analysis frame, so this
        # normally adds no second resize to the hot path.
        working = frame
        if frame.shape[1] > 240 or frame.shape[0] > 135:
            working = cv2.resize(
                frame, (240, 135), interpolation=cv2.INTER_AREA
            )
        gray = cv2.cvtColor(working, cv2.COLOR_BGR2GRAY)

        # Check several heights because slicing may affect only part of a frame.
        for height_ratio in (0.35, 0.50, 0.70, 1.0):
            roi = gray[: max(16, int(gray.shape[0] * height_ratio)), :]
            tile_width = roi.shape[1] // 3
            left = roi[:, :tile_width]
            middle = roi[:, tile_width : tile_width * 2]
            right = roi[:, tile_width * 2 : tile_width * 3]

            left_middle = _normalized_correlation(left, middle)
            middle_right = _normalized_correlation(middle, right)

            # Both boundaries must repeat the same textured scene. This avoids
            # false positives on flat walls, darkness, or an obstructed lens.
            if (
                left_middle > 0.72
                and middle_right > 0.72
                and float(roi.std()) > 12.0
            ):
                return True
    except (cv2.error, ValueError):
        return True

    return False
