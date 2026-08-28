from datetime import datetime

from sqlalchemy import select

from app.api.faces import apply_detection_date_filters
from app.models.face import Face


def _compiled_where(sql):
    return str(sql.compile(compile_kwargs={"literal_binds": True}))


def test_detection_date_filters_accept_from_and_to_range():
    query = apply_detection_date_filters(
        select(Face),
        date=None,
        from_date="2026-07-01",
        to_date="2026-07-31",
    )

    where_sql = _compiled_where(query)

    assert "faces.timestamp >= '2026-07-01 00:00:00'" in where_sql
    assert "faces.timestamp < '2026-08-01 00:00:00'" in where_sql


def test_detection_date_filters_preserve_single_date_filter():
    query = apply_detection_date_filters(
        select(Face),
        date="2026-07-07",
        from_date=None,
        to_date=None,
    )

    where_sql = _compiled_where(query)

    assert "CAST(faces.timestamp AS DATE) = '2026-07-07'" in where_sql
