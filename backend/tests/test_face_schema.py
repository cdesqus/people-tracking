from app.schemas.face import BoundingBox


def test_bounding_box_accepts_legacy_capitalized_keys():
    box = BoundingBox.model_validate(
        {"Top": 0.1, "Left": 0.2, "Width": 0.3, "Height": 0.4}
    )

    assert box.model_dump() == {
        "top": 0.1,
        "left": 0.2,
        "width": 0.3,
        "height": 0.4,
    }


def test_bounding_box_accepts_lowercase_keys():
    box = BoundingBox.model_validate(
        {"top": 0.1, "left": 0.2, "width": 0.3, "height": 0.4}
    )

    assert box.left == 0.2
