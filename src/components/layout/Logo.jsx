const LOGO_URL = "https://media.base44.com/images/public/69b73bf820481df67e8a6ca5/7470c0106_35BF6E58-6CC5-488B-A9A8-88780E351F47.jpeg";

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