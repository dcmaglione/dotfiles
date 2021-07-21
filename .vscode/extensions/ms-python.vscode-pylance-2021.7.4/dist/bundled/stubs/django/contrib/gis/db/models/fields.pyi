from typing import Any, Iterable, NamedTuple, Optional, Tuple, TypeVar, Union

from django.db.models.fields import Field, _ErrorMessagesToOverride, _FieldChoices, _ValidatorCallable

# __set__ value type
_ST = TypeVar("_ST")
# __get__ return type
_GT = TypeVar("_GT")

class SRIDCacheEntry(NamedTuple):
    units: Any
    units_name: str
    geodetic: bool
    spheroid: str

def get_srid_info(srid: int, connection: Any) -> SRIDCacheEntry: ...

class BaseSpatialField(Field[_ST, _GT]):
    def __init__(
        self,
        verbose_name: Optional[Union[str, bytes]] = ...,
        srid: int = ...,
        spatial_index: bool = ...,
        name: Optional[str] = ...,
        primary_key: bool = ...,
        max_length: Optional[int] = ...,
        unique: bool = ...,
        blank: bool = ...,
        null: bool = ...,
        db_index: bool = ...,
        default: Any = ...,
        editable: bool = ...,
        auto_created: bool = ...,
        serialize: bool = ...,
        unique_for_date: Optional[str] = ...,
        unique_for_month: Optional[str] = ...,
        unique_for_year: Optional[str] = ...,
        choices: Optional[_FieldChoices] = ...,
        help_text: str = ...,
        db_column: Optional[str] = ...,
        db_tablespace: Optional[str] = ...,
        validators: Iterable[_ValidatorCallable] = ...,
        error_messages: Optional[_ErrorMessagesToOverride] = ...,
    ): ...
    def deconstruct(self): ...
    def db_type(self, connection: Any): ...
    def spheroid(self, connection: Any): ...
    def units(self, connection: Any): ...
    def units_name(self, connection: Any): ...
    def geodetic(self, connection: Any): ...
    def get_placeholder(self, value: Any, compiler: Any, connection: Any): ...
    def get_srid(self, obj: Any): ...
    def get_db_prep_value(self, value: Any, connection: Any, *args: Any, **kwargs: Any): ...
    def get_raster_prep_value(self, value: Any, is_candidate: Any): ...
    def get_prep_value(self, value: Any): ...

class GeometryField(BaseSpatialField):
    description: Any = ...
    form_class: Any = ...
    geom_type: str = ...
    geom_class: Any = ...
    dim: Any = ...
    geography: Any = ...
    def __init__(
        self,
        verbose_name: Optional[Union[str, bytes]] = ...,
        dim: int = ...,
        geography: bool = ...,
        extent: Tuple[float, float, float, float] = ...,
        tolerance: float = ...,
        srid: int = ...,
        spatial_index: bool = ...,
        name: Optional[str] = ...,
        primary_key: bool = ...,
        max_length: Optional[int] = ...,
        unique: bool = ...,
        blank: bool = ...,
        null: bool = ...,
        db_index: bool = ...,
        default: Any = ...,
        editable: bool = ...,
        auto_created: bool = ...,
        serialize: bool = ...,
        unique_for_date: Optional[str] = ...,
        unique_for_month: Optional[str] = ...,
        unique_for_year: Optional[str] = ...,
        choices: Optional[_FieldChoices] = ...,
        help_text: str = ...,
        db_column: Optional[str] = ...,
        db_tablespace: Optional[str] = ...,
        validators: Iterable[_ValidatorCallable] = ...,
        error_messages: Optional[_ErrorMessagesToOverride] = ...,
    ): ...
    def deconstruct(self): ...
    def formfield(self, **kwargs: Any): ...
    def select_format(self, compiler: Any, sql: Any, params: Any): ...

class PointField(GeometryField):
    geom_type: str = ...
    geom_class: Any = ...
    form_class: Any = ...
    description: Any = ...

class LineStringField(GeometryField):
    geom_type: str = ...
    geom_class: Any = ...
    form_class: Any = ...
    description: Any = ...

class PolygonField(GeometryField):
    geom_type: str = ...
    geom_class: Any = ...
    form_class: Any = ...
    description: Any = ...

class MultiPointField(GeometryField):
    geom_type: str = ...
    geom_class: Any = ...
    form_class: Any = ...
    description: Any = ...

class MultiLineStringField(GeometryField):
    geom_type: str = ...
    geom_class: Any = ...
    form_class: Any = ...
    description: Any = ...

class MultiPolygonField(GeometryField):
    geom_type: str = ...
    geom_class: Any = ...
    form_class: Any = ...
    description: Any = ...

class GeometryCollectionField(GeometryField):
    geom_type: str = ...
    geom_class: Any = ...
    form_class: Any = ...
    description: Any = ...

class ExtentField(Field):
    description: Any = ...
    def get_internal_type(self): ...
    def select_format(self, compiler: Any, sql: Any, params: Any): ...

class RasterField(BaseSpatialField):
    description: Any = ...
    geom_type: str = ...
    geography: bool = ...
    def db_type(self, connection: Any): ...
    def from_db_value(self, value: Any, expression: Any, connection: Any): ...
    def get_transform(self, name: Any): ...
