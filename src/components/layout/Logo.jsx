const LOGO_URL = "https://media.base44.com/images/public/69b73bf820481df67e8a6ca5/a280ac1c0_1000029970.png";

export { LOGO_URL };

export default function Logo({ size = 32, className = "" }) {
  return (
    <img
      src={LOGO_URL}
      alt="Flint Eats"
      className={`rounded-full object-cover shrink-0 bg-white ${className}`}
      style={{ width: size, height: size }}
    />
  );
}