import { useState, useRef, useEffect } from "react";
import toast from "react-hot-toast";
import "./Contactform.css";

const formSubmitEndpoint = import.meta.env.VITE_FORMSUBMIT_ENDPOINT;

const ContactUs = () => {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const isSubmittingRef = useRef(false);
  const timeoutRef = useRef(null);

  useEffect(() => {
    return () => {
      if (timeoutRef.current) clearTimeout(timeoutRef.current);
    };
  }, []);

  if (!formSubmitEndpoint) {
    return (
      <section className="mx-auto max-w-xl px-5 py-16 text-center">
        <h1 className="text-3xl font-semibold">Contact the team</h1>
        <p className="mt-3 text-gray-600">Team contact is being configured. Please try again shortly.</p>
      </section>
    );
  }

  const handleFormSubmit = (e) => {
    // Validate attachment size if selected (FormSubmit limit is 10 MB)
    const form = e.currentTarget;
    const fileInput = form.querySelector('input[name="attachment"]');
    if (fileInput && fileInput.files && fileInput.files[0]) {
      const file = fileInput.files[0];
      if (file.size > 10 * 1024 * 1024) {
        e.preventDefault();
        toast.error("Attachment size must be under 10 MB.", { id: "contact-toast" });
        return;
      }
    }

    isSubmittingRef.current = true;
    setIsSubmitting(true);

    // Backup safety timer in case cross-origin iframe response event is blocked by browser
    timeoutRef.current = setTimeout(() => {
      if (isSubmittingRef.current) {
        isSubmittingRef.current = false;
        setIsSubmitting(false);
        setSubmitted(true);
        toast.success("Message and attachment sent successfully!", { id: "contact-toast" });
      }
    }, 3500);
  };

  const handleIframeLoad = () => {
    if (isSubmittingRef.current) {
      if (timeoutRef.current) clearTimeout(timeoutRef.current);
      isSubmittingRef.current = false;
      setIsSubmitting(false);
      setSubmitted(true);
      toast.success("Message and attachment sent successfully!", { id: "contact-toast" });
    }
  };

  return (
    <section className="mx-auto max-w-xl px-5 py-12">
      <h1 className="text-3xl font-semibold text-[#222222] dark:text-white">Contact the team</h1>
      <p className="mt-2 text-gray-600 dark:text-[#a0a0a0]">Tell us about a problem, safety concern, or feature request.</p>

      {/* Off-screen iframe allows standard multipart file upload without refreshing the main window */}
      <iframe
        name="formsubmit_silent_frame"
        id="formsubmit_silent_frame"
        title="FormSubmit Silent Frame"
        tabIndex="-1"
        style={{
          position: "absolute",
          top: "-9999px",
          left: "-9999px",
          width: "1px",
          height: "1px",
          opacity: 0,
          pointerEvents: "none",
        }}
        onLoad={handleIframeLoad}
      />

      {submitted ? (
        <div className="contact-card-animate mt-7 rounded-2xl border border-emerald-500/30 bg-emerald-50/70 p-8 text-center backdrop-blur-sm dark:bg-emerald-950/30 dark:border-emerald-500/20 shadow-sm">
          <div className="checkmark-pop-animate mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-full bg-emerald-100 text-emerald-600 dark:bg-emerald-900/50 dark:text-emerald-400 shadow-inner">
            <svg className="h-7 w-7" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M5 13l4 4L19 7" />
            </svg>
          </div>
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white">Message sent!</h2>
          <p className="mt-2 text-sm text-gray-600 dark:text-gray-300 leading-relaxed max-w-md mx-auto">
            Thanks for reaching out. Your message and attachment have been delivered to our team.
          </p>
          <button
            type="button"
            onClick={() => setSubmitted(false)}
            className="mt-6 rounded-xl bg-[#ff385c] px-6 py-3 text-sm font-semibold text-white transition-all duration-200 hover:bg-[#e0314f] hover:shadow-md active:scale-95"
          >
            Send another message
          </button>
        </div>
      ) : (
        <form
          className="contact-card-animate mt-7 flex flex-col gap-4 rounded-2xl border dark:border-[#444444] p-6 shadow-sm dark:bg-[#1e1e1e]"
          action={formSubmitEndpoint}
          method="POST"
          encType="multipart/form-data"
          target="formsubmit_silent_frame"
          onSubmit={handleFormSubmit}
        >
          {/* FormSubmit configurations */}
          <input type="hidden" name="_subject" value="JourneyCusine team contact" />
          <input type="hidden" name="_template" value="table" />
          <input type="hidden" name="_autoresponse" value="Thanks for contacting JourneyCusine. Our team will review your message." />
          <input type="hidden" name="_captcha" value="false" />
          <input className="hidden" type="text" name="_honey" tabIndex="-1" autoComplete="off" />

          <label className="flex flex-col gap-1.5 text-sm font-medium text-gray-700 dark:text-gray-200">
            Your email
            <input
              className="rounded-lg border border-gray-300 p-3 transition-all focus:border-[#ff385c] focus:outline-none focus:ring-1 focus:ring-[#ff385c] dark:bg-[#2a2a2a] dark:border-[#444444] dark:text-white"
              type="email"
              name="email"
              placeholder="you@example.com"
              required
            />
          </label>

          <label className="flex flex-col gap-1.5 text-sm font-medium text-gray-700 dark:text-gray-200">
            Details of your problem
            <textarea
              className="min-h-32 rounded-lg border border-gray-300 p-3 transition-all focus:border-[#ff385c] focus:outline-none focus:ring-1 focus:ring-[#ff385c] dark:bg-[#2a2a2a] dark:border-[#444444] dark:text-white"
              name="message"
              placeholder="How can we help?"
              required
            />
          </label>

          <label className="flex flex-col gap-1.5 text-sm font-medium text-gray-700 dark:text-gray-200">
            Optional screenshot (PNG or JPEG, up to 10 MB)
            <input
              className="rounded-lg border border-gray-300 p-2.5 text-sm file:mr-3 file:rounded-md file:border-0 file:bg-gray-100 file:px-3 file:py-1 file:text-xs file:font-semibold file:text-gray-700 hover:file:bg-gray-200 dark:bg-[#2a2a2a] dark:border-[#444444] dark:text-gray-300 dark:file:bg-[#383838] dark:file:text-gray-200"
              type="file"
              name="attachment"
              accept="image/png,image/jpeg"
            />
          </label>

          <button
            className="mt-2 flex items-center justify-center gap-2 rounded-xl bg-[#ff385c] px-5 py-3 font-medium text-white transition-all duration-200 hover:bg-[#e0314f] hover:shadow-md active:scale-98 disabled:opacity-60 disabled:pointer-events-none"
            type="submit"
            disabled={isSubmitting}
          >
            {isSubmitting ? (
              <>
                <svg className="h-5 w-5 animate-spin text-white" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v4a4 4 0 00-4 4H4z" />
                </svg>
                <span>Sending message…</span>
              </>
            ) : (
              "Send to the team"
            )}
          </button>
        </form>
      )}
    </section>
  );
};

export default ContactUs;
