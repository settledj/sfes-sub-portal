import { useRef } from "react";
import { Camera } from "lucide-react";
import { C } from "@/lib/constants";
import { WOLF_LOGO_SRC } from "@/lib/assets";
import { effectiveStatus, type RawAvailability } from "@/lib/availability";

export interface AvatarPerson {
  name: string;
  initials: string;
  accent: string;
  photo: string | null;
}

export function Avatar({
  sub,
  size = 48,
  showBadge = false,
  badgeStatus,
}: {
  sub: AvatarPerson;
  size?: number;
  showBadge?: boolean;
  badgeStatus?: RawAvailability;
}) {
  const status = effectiveStatus(badgeStatus);
  const badgeColor = status === "booked" ? C.gold : status === "unavailable" ? C.red : C.teal;
  return (
    <div className="relative shrink-0" style={{ width: size, height: size }}>
      {sub.photo ? (
        // eslint-disable-next-line @next/next/no-img-element
        <img
          src={sub.photo}
          alt={sub.name}
          className="rounded-full"
          style={{ width: size, height: size, objectFit: "cover" }}
        />
      ) : (
        <div
          className="flex items-center justify-center rounded-full text-white font-semibold"
          style={{
            width: size,
            height: size,
            backgroundColor: sub.accent,
            fontFamily: "Barlow, sans-serif",
            fontSize: size * 0.36,
            letterSpacing: 0.5,
          }}
        >
          {sub.initials}
        </div>
      )}
      {showBadge && (
        <div
          className="absolute -bottom-0.5 -right-0.5 rounded-full border-2 border-white flex items-center justify-center"
          style={{ width: size * 0.42, height: size * 0.42, backgroundColor: badgeColor, padding: 2 }}
          title={status}
        >
          <div className="rounded-full bg-white flex items-center justify-center w-full h-full">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src={WOLF_LOGO_SRC} alt="" style={{ width: "72%", height: "72%", objectFit: "contain" }} />
          </div>
        </div>
      )}
    </div>
  );
}

// Two overlapping avatars — e.g. a teacher and the substitute covering for
// them — so a booking row reads at a glance without a name lookup. Primary
// sits full-size top-left; secondary is smaller, bottom-right, with a white
// ring so it stays legible against the primary photo.
export function AvatarPair({
  primary,
  secondary,
  size = 40,
}: {
  primary: AvatarPerson;
  secondary?: AvatarPerson;
  size?: number;
}) {
  if (!secondary) return <Avatar sub={primary} size={size} />;
  const secondarySize = size * 0.62;
  return (
    <div className="relative shrink-0" style={{ width: size + secondarySize * 0.35, height: size + secondarySize * 0.35 }}>
      <div className="absolute top-0 left-0">
        <Avatar sub={primary} size={size} />
      </div>
      <div className="absolute bottom-0 right-0 rounded-full" style={{ boxShadow: "0 0 0 2px white" }}>
        <Avatar sub={secondary} size={secondarySize} />
      </div>
    </div>
  );
}

// Wraps Avatar with a tap-to-change-photo affordance. Opens the device's native
// picker, which on mobile offers both "Take Photo" and "Choose from Library".
export function EditableAvatar({
  person,
  size = 56,
  onPhotoChange,
}: {
  person: AvatarPerson;
  size?: number;
  onPhotoChange: (dataUri: string) => void;
}) {
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = () => onPhotoChange(reader.result as string);
    reader.readAsDataURL(file);
    e.target.value = ""; // allow re-selecting the same file later
  };

  return (
    <div className="relative shrink-0" style={{ width: size, height: size }}>
      <button
        onClick={() => fileInputRef.current?.click()}
        className="block rounded-full"
        style={{ width: size, height: size }}
        title="Change photo"
      >
        <Avatar sub={person} size={size} />
      </button>
      <div
        className="absolute -bottom-0.5 -right-0.5 flex items-center justify-center rounded-full border-2 border-white pointer-events-none"
        style={{ width: size * 0.4, height: size * 0.4, backgroundColor: C.navy }}
      >
        <Camera size={size * 0.22} color="white" />
      </div>
      <input ref={fileInputRef} type="file" accept="image/*" onChange={handleFileChange} className="hidden" />
    </div>
  );
}
