import facebookIcon from "../../assets/basicIcon/facebookIcon.svg";
import linkedinIcon from "../../assets/basicIcon/linkedinIcon.svg";

const Footer = () => {
  return (
    <footer className="py-12 bg-[#f7f7f7] dark:bg-[#121212] border-t border-[#dddddd] dark:border-neutral-800 text-sm text-[#222222] dark:text-neutral-300 relative bottom-0 z-[20] transition-colors">
      <section className="grid grid-cols-2 md:grid-cols-4 gap-8 justify-between max-w-screen-2xl mx-auto px-10">
        <div className="flex flex-col gap-3.5">
          <a href="https://journey-support.vercel.app">
            <h6 className="font-bold text-[#111827] dark:text-white mb-1">Support</h6>
          </a> 
          <a href="https://journey-support.vercel.app" className="hover:underline text-neutral-600 dark:text-neutral-400 hover:text-black dark:hover:text-white">
            <p>Help Center</p>
          </a>
          <a href="https://journey-support.vercel.app" className="hover:underline text-neutral-600 dark:text-neutral-400 hover:text-black dark:hover:text-white">
            <p>Get help with a safety issue</p>
          </a>
          <a href="https://journey-support.vercel.app" className="hover:underline text-neutral-600 dark:text-neutral-400 hover:text-black dark:hover:text-white">
            <p>MotelCover</p>
          </a>
          <a href="https://journey-support.vercel.app" className="hover:underline text-neutral-600 dark:text-neutral-400 hover:text-black dark:hover:text-white">
            <p>Supporting people with disabilities</p>
          </a>
          <a href="https://journey-support.vercel.app" className="hover:underline text-neutral-600 dark:text-neutral-400 hover:text-black dark:hover:text-white">
            <p>Cancelation options</p>
          </a>
          <a href="https://covid19-sg.netlify.app" className="hover:underline text-neutral-600 dark:text-neutral-400 hover:text-black dark:hover:text-white">
            <p>Our Covid-19 response</p>
          </a>
          <a href="https://journey-support.vercel.app" className="hover:underline text-neutral-600 dark:text-neutral-400 hover:text-black dark:hover:text-white">
            <p>Report a neighborhood concern</p>
          </a>
        </div>
        <div className="flex flex-col gap-3.5">
          <h6 className="font-bold text-[#111827] dark:text-white mb-1">Community</h6>
          <a href="https://journey-support.vercel.app" className="hover:underline text-neutral-600 dark:text-neutral-400 hover:text-black dark:hover:text-white">
            <p>Motel.org: Disaster relief housing</p>
          </a>
          <a href="https://journey-support.vercel.app" className="hover:underline text-neutral-600 dark:text-neutral-400 hover:text-black dark:hover:text-white">
            <p>Combating discrimination</p>
          </a>
        </div>
        <div className="flex flex-col gap-3.5">
          <h6 className="font-bold text-[#111827] dark:text-white mb-1">Hosting</h6>
          <a href="/host/homes" className="hover:underline text-neutral-600 dark:text-neutral-400 hover:text-black dark:hover:text-white">
            <p>Motel your home</p>
          </a>
          <a href="/host/homes" className="hover:underline text-neutral-600 dark:text-neutral-400 hover:text-black dark:hover:text-white">
            <p>MotelCover for Hosts</p>
          </a>
          <a href="/host/homes" className="hover:underline text-neutral-600 dark:text-neutral-400 hover:text-black dark:hover:text-white">
            <p>Explore hosting resources</p>
          </a>
          <a href="/host/homes" className="hover:underline text-neutral-600 dark:text-neutral-400 hover:text-black dark:hover:text-white">
            <p>Visit our community forum</p>
          </a>
          <a href="/host/homes" className="hover:underline text-neutral-600 dark:text-neutral-400 hover:text-black dark:hover:text-white">
            <p>How to host responsibly</p>
          </a>
          <a href="/host/homes" className="hover:underline text-neutral-600 dark:text-neutral-400 hover:text-black dark:hover:text-white">
            <p>Motel friendly apartments</p>
          </a>
        </div>
        <div className="flex flex-col gap-3.5">
          <h6 className="font-bold text-[#111827] dark:text-white mb-1">Motel</h6>
          <p className="text-neutral-600 dark:text-neutral-400">Newsroom</p>
          <a href="/host/homes" className="hover:underline text-neutral-600 dark:text-neutral-400 hover:text-black dark:hover:text-white">
            <p>MotelCover for Hosts</p>
          </a>
          <a href="/host/homes" className="hover:underline text-neutral-600 dark:text-neutral-400 hover:text-black dark:hover:text-white">
            <p>Explore hosting resources</p>
          </a>
          <a href="/host/homes" className="hover:underline text-neutral-600 dark:text-neutral-400 hover:text-black dark:hover:text-white">
            <p>Visit our community forum</p>
          </a>
          <a href="/host/homes" className="hover:underline text-neutral-600 dark:text-neutral-400 hover:text-black dark:hover:text-white">
            <p>How to host responsibly</p>
          </a>
          <a href="/host/homes" className="hover:underline text-neutral-600 dark:text-neutral-400 hover:text-black dark:hover:text-white">
            <p>Motel friendly apartments</p>
          </a>
        </div>
      </section>
      <hr className="border-t border-neutral-200 dark:border-neutral-800 mt-10 mb-6 max-w-screen-2xl mx-auto" />
      <section className="flex flex-row flex-wrap justify-between gap-6 px-10 max-w-screen-2xl mx-auto text-xs text-neutral-500 dark:text-neutral-400">
        <div className="flex flex-row flex-wrap items-center gap-1">
          <p>© 2024 Journey Cuisine, Inc.</p>
          <span className="px-2">·</span>
          <p className="hover:underline cursor-pointer">Terms</p>
          <span className="px-2">·</span>
          <p className="hover:underline cursor-pointer">Privacy</p>
          <span className="px-2">·</span>
          <p className="hover:underline cursor-pointer">Your Privacy Choices</p>
        </div>
        <div className="flex flex-row gap-5 min-w-[120px] items-center">
          <p>English (US)</p>
          <a href="https://www.facebook.com" aria-label="Facebook">
            <img src={facebookIcon} alt="Facebook" className="w-5 dark:invert opacity-80 hover:opacity-100 transition-opacity" />
          </a>
          <a href="https://www.linkedin.com/in/sk-mirajul-islam-876438261/" aria-label="LinkedIn">
            <img src={linkedinIcon} alt="Linkedin" className="w-5 dark:invert opacity-80 hover:opacity-100 transition-opacity" />
          </a>
        </div>
      </section>
    </footer>
  );
};

export default Footer;
