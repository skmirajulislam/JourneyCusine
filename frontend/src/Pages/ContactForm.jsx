import { useState } from "react";
import "./Contactform.css";

const formSubmitEndpoint = import.meta.env.VITE_FORMSUBMIT_ENDPOINT;

const ContactUs = () => {
  const [isSubmitting, setIsSubmitting] = useState(false);

  if (!formSubmitEndpoint) {
    return <section className="mx-auto max-w-xl px-5 py-16 text-center"><h1 className="text-3xl font-semibold">Contact the team</h1><p className="mt-3 text-gray-600">Team contact is being configured. Please try again shortly.</p></section>;
  }

  return (
    <section className="mx-auto max-w-xl px-5 py-12">
      <h1 className="text-3xl font-semibold text-[#222222] dark:text-white">Contact the team</h1>
      <p className="mt-2 text-gray-600 dark:text-[#a0a0a0]">Tell us about a problem, safety concern, or feature request.</p>
      <form className="mt-7 flex flex-col gap-4 rounded-xl border dark:border-[#444444] p-6 shadow-sm dark:bg-[#1e1e1e]" method="POST" action={formSubmitEndpoint} encType="multipart/form-data" onSubmit={() => setIsSubmitting(true)}>
        <input type="hidden" name="_subject" value="JourneyCusine team contact" />
        <input type="hidden" name="_template" value="table" />
        <input type="hidden" name="_autoresponse" value="Thanks for contacting JourneyCusine. Our team will review your message." />
        <input className="hidden" type="text" name="_honey" tabIndex="-1" autoComplete="off" />
        <label className="flex flex-col gap-1 text-sm font-medium">Your email<input className="rounded-md border p-3" type="email" name="email" placeholder="you@example.com" required /></label>
        <label className="flex flex-col gap-1 text-sm font-medium">Details of your problem<textarea className="min-h-32 rounded-md border p-3" name="message" placeholder="How can we help?" required /></label>
        <label className="flex flex-col gap-1 text-sm font-medium">Optional screenshot (PNG or JPEG, up to 10 MB)<input type="file" name="attachment" accept="image/png,image/jpeg" /></label>
        <button className="rounded-md bg-[#ff385c] px-4 py-3 font-medium text-white disabled:opacity-60" type="submit" disabled={isSubmitting}>{isSubmitting ? "Sending…" : "Send to the team"}</button>
      </form>
    </section>
  );
};

export default ContactUs;
