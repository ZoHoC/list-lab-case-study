import type { FeatureLike } from 'ol/Feature';

export function getMvtFeatureId(
  feature: FeatureLike,
): string | number | null {
  const anyFeat: any = feature as any;
  const byId = anyFeat.getId?.();
  if (byId !== undefined && byId !== null) return byId as string | number;

  const props = anyFeat.getProperties?.() ?? {};
  return (
    props.id ??
    props.gid ??
    props.objectid ??
    props.parcel_id ??
    props.parcelid ??
    null
  );
}
