import facebookIcon from "../../assets/basicIcon/facebookIcon.svg";
import linkedinIcon from "../../assets/basicIcon/linkedinIcon.svg";

const Footer = () => {
  return (
    <footer className=" py-12 bg-[#f7f7f7] border-t border-[#dddddd] text-sm text-[#222222] relative bottom-0 z-[20]">
      <section className=" grid grid-cols-2 md:grid-cols-4 gap-8 justify-between max-w-screen-2xl mx-auto px-10">
        <div className="flex flex-col gap-4 opacity-80">
           <a href="https://journey-support.vercel.app">
            <h6 className="font-semibold">Support</h6>
          </a> 
          <a href="https://journey-support.vercel.app">
            <p>Help Center</p>
          </a>
          <a href="https://journey-support.vercel.app">
            <p>Get help with a safety issue</p>
          </a>
          <a href="https://journey-support.vercel.app">
            <p>MotelCover</p>
          </a>
          <a href="https://journey-support.vercel.app">
            <p>Supporting people with disabilities</p>
          </a>
          <a href="https://journey-support.vercel.app">
            <p>Cancelation options</p>
          </a>
          <a href="https://covid19-sg.netlify.app">
            <p>Our Covid-19 response</p>
          </a>
          <a href="https://journey-support.vercel.app">
            <p>Report a neighborhood concern</p>
          </a>
        </div>
        <div className="flex flex-col gap-4 opacity-80">
          <h6 className="font-semibold">Community</h6>
          <a href="https://journey-support.vercel.app">
          <p>Motel.org: Disaster relief housing</p>
          </a>
          <a href="https://journey-support.vercel.app">
          <p>Combating discrimination</p>
            </a>
        </div>
        <div className="flex flex-col gap-4 opacity-80">
          <h6 className="font-semibold">Hosting</h6>
          <a href="https://journey-cusine-git-master-skmirajulislams-projects.vercel.app/host/homes">
    <p>Motel your home</p>
</a>
<a href="https://journey-cusine-git-master-skmirajulislams-projects.vercel.app/host/homes">
    <p>MotelCover for Hosts</p>
</a>
<a href="https://journey-cusine-git-master-skmirajulislams-projects.vercel.app/host/homes">
    <p>Explore hosting resources</p>
</a>
<a href="https://journey-cusine-git-master-skmirajulislams-projects.vercel.app/host/homes">
    <p>Visit our community forum</p>
</a>
<a href="https://journey-cusine-git-master-skmirajulislams-projects.vercel.app/host/homes">
    <p>How to host responsibly</p>
</a>
<a href="https://journey-cusine-git-master-skmirajulislams-projects.vercel.app/host/homes">
    <p>Motel friendly apartments</p>
</a>
        </div>
        <div className="flex flex-col gap-4 opacity-80">
          <h6 className="font-semibold">Motel</h6>
          <p>Newsroom</p>
          <a href="https://journey-cusine-git-master-skmirajulislams-projects.vercel.app/host/homes">
    <p>MotelCover for Hosts</p>
</a>
<a href="https://journey-cusine-git-master-skmirajulislams-projects.vercel.app/host/homes">
    <p>Explore hosting resources</p>
</a>
<a href="https://journey-cusine-git-master-skmirajulislams-projects.vercel.app/host/homes">
    <p>Visit our community forum</p>
</a>
<a href="https://journey-cusine-git-master-skmirajulislams-projects.vercel.app/host/homes">
    <p>How to host responsibly</p>
</a>
<a href="https://journey-cusine-git-master-skmirajulislams-projects.vercel.app/host/homes">
    <p>Motel friendly apartments</p>
</a>
        </div>
      </section>
      <hr className="bg-[#f7f7f7] mt-10 mb-6" />
      <section className=" flex flex-row flex-wrap justify-between gap-10 px-10 max-w-screen-2xl mx-auto">
        <div className=" flex flex-row flex-wrap items-center">
          <p>© 2024 Journey Cuisine, Inc.</p>
          <span className=" p-3">·</span>
          <p>Terms</p>
          <span className=" p-3">·</span>
          <p>Privacy</p>
          <span className=" p-3">·</span>
          <p>Your Privacy Choices</p>
        </div>
        <div className=" flex flex-row gap-5 min-w-[120px] items-center">
          <p>English (US)</p>
          <a href="https://www.facebook.com">
            <img src={facebookIcon} alt="Facebook" className=" w-6" />
          </a>
          <a href="https://www.linkedin.com/in/sk-mirajul-islam-876438261/">
            <img src={linkedinIcon} alt="Linkedin" className=" w-6" />
          </a>
        </div>
      </section>
    </footer>
  );
};

export default Footer;
