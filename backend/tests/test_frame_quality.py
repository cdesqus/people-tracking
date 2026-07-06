import numpy as np

from app.services.frame_quality import has_slicing_artifact


def test_normal_frame_is_allowed():
    frame = np.random.default_rng(42).integers(
        0, 256, (90, 160, 3), dtype=np.uint8
    )

    assert has_slicing_artifact(frame) is False


def test_repeated_tiles_in_upper_frame_are_rejected():
    rng = np.random.default_rng(7)
    frame = rng.integers(0, 256, (90, 160, 3), dtype=np.uint8)
    tile = rng.integers(0, 256, (45, 53, 3), dtype=np.uint8)
    frame[:45, :53] = tile
    frame[:45, 53:106] = tile
    frame[:45, 106:159] = tile

    assert has_slicing_artifact(frame) is True


def test_flat_frame_is_not_mistaken_for_slicing():
    frame = np.zeros((90, 160, 3), dtype=np.uint8)

    assert has_slicing_artifact(frame) is False
