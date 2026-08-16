import { Link } from "react-router-dom";
import facebookIcon from "../../assets/basicIcon/facebookIcon.svg";
import linkedinIcon from "../../assets/basicIcon/linkedinIcon.svg";

const linkClass =
  "hover:underline text-neutral-600 dark:text-neutral-400 hover:text-black dark:hover:text-white transition-colors";

const Footer = () => {
  return (
    <footer className="py-12 bg-[#f7f7f7] dark:bg-[#121212] border-t border-[#dddddd] dark:border-neutral-800 text-sm text-[#222222] dark:text-neutral-300 relative bottom-0 z-[20] transition-colors">
      <section className="grid grid-cols-2 md:grid-cols-4 gap-8 justify-between max-w-screen-2xl mx-auto px-10">
        {/* Support */}
        <div className="flex flex-col gap-3.5">
          <h6 className="font-bold text-[#111827] dark:text-white mb-1">Support</h6>
          <Link to="/contact" className={linkClass}>
            Contact the team
          </Link>
          <Link to="/contact" className={linkClass}>
            Help Center
          </Link>
          <Link to="/contact" className={linkClass}>
            Report an issue
          </Link>
        </div>

        {/* Hosting */}
        <div className="flex flex-col gap-3.5">
          <h6 className="font-bold text-[#111827] dark:text-white mb-1">Hosting</h6>
          <Link to="/host/homes" className={linkClass}>
            Motel your home
          </Link>
          <Link to="/become-a-host" className={linkClass}>
            Become a host
          </Link>
          <Link to="/host/homes" className={linkClass}>
            Hosting resources
          </Link>
        </div>

        {/* Explore */}
        <div className="flex flex-col gap-3.5">
          <h6 className="font-bold text-[#111827] dark:text-white mb-1">Explore</h6>
          <Link to="/" className={linkClass}>
            Browse stays
          </Link>
          <Link to="/wishlists" className={linkClass}>
            Wishlists
          </Link>
          <Link to="/trips" className={linkClass}>
            Your trips
          </Link>
        </div>

        {/* Journey Cuisine */}
        <div className="flex flex-col gap-3.5">
          <h6 className="font-bold text-[#111827] dark:text-white mb-1">Journey Cuisine</h6>
          <p className="text-neutral-600 dark:text-neutral-400">
            Discover unique stays and culinary experiences around the world. Book with confidence, host with pride.
          </p>
          <div className="flex flex-row gap-4 mt-1 items-center">
            <a
              href="https://www.facebook.com"
              target="_blank"
              rel="noopener noreferrer"
              aria-label="Facebook"
            >
              <img
                src={facebookIcon}
                alt="Facebook"
                className="w-5 dark:invert opacity-70 hover:opacity-100 transition-opacity"
              />
            </a>
            <a
              href="https://www.linkedin.com/in/sk-mirajul-islam-876438261/"
              target="_blank"
              rel="noopener noreferrer"
              aria-label="LinkedIn"
            >
              <img
                src={linkedinIcon}
                alt="LinkedIn"
                className="w-5 dark:invert opacity-70 hover:opacity-100 transition-opacity"
              />
            </a>
          </div>
        </div>
      </section>

      <hr className="border-t border-neutral-200 dark:border-neutral-800 mt-10 mb-6 max-w-screen-2xl mx-auto" />

      <section className="flex flex-row flex-wrap justify-between gap-6 px-10 max-w-screen-2xl mx-auto text-xs text-neutral-500 dark:text-neutral-400">
        <div className="flex flex-row flex-wrap items-center gap-1">
          <p>© {new Date().getFullYear()} Journey Cuisine, Inc.</p>
          <span className="px-2">·</span>
          <p className="hover:underline cursor-pointer">Terms</p>
          <span className="px-2">·</span>
          <p className="hover:underline cursor-pointer">Privacy</p>
        </div>
        <div className="flex flex-row gap-3 items-center">
          <p>English (US)</p>
        </div>
      </section>
    </footer>
  );
};

export default Footer;
