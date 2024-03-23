import { useRef, useState } from 'react';
import emailjs from '@emailjs/browser';

export const ContactUs = () => {
    const form = useRef();
    const [sentSuccessfully, setSentSuccessfully] = useState(false);
    const [errorOccurred, setErrorOccurred] = useState(false);

    const sendEmail = (e) => {
        e.preventDefault();

        // Get client's email address and name from the form
        const clientName = form.current['user_name'].value;

    

        // Send email to the admin
        emailjs
            .send('service_pifdyyh', 'template_8e0ov6p', {
                user_email: 'skmirajulislam181@gmail.com', // Admin email
                message: `Query from ${clientName}: ${form.current['message'].value}`,
            }, { publicKey: 'W7JLonZhnMYOR4Vb7' })
            .then(() => {
                console.log('Email sent to admin!');
                setSentSuccessfully(true)
            })
            .catch((error) => {
                console.error('Error sending email to admin:', error);
                setErrorOccurred(true);
            });
    };


    return (
        <form ref={form} onSubmit={sendEmail}>
            <label>Name</label>
            <input type="text" name="user_name" required />
            <label>Email</label>
            <input type="email" name="user_email" required />
            <label>Message</label>
            <textarea name="message" required />
            <input type="submit" value="Send" />
            {sentSuccessfully && <p className="success-message">Email sent successfully!</p>}
            {errorOccurred && <p className="error-message">An error occurred. Please try again later.</p>}
        </form>
    );
};

export default ContactUs;