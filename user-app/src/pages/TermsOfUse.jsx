import { Link } from 'react-router-dom'

export default function TermsOfUse() {
  return (
    <div className="legal-page">
      <div className="legal-container">
        <h1>Bluvberry Conditions of Use</h1>
        <p className="last-updated">Last updated: January 10, 2026</p>

        <section>
          <h2>Welcome to Bluvberry</h2>
          <p>
            Bluvberry provides its services to you subject to the following conditions. 
            If you visit or shop at Bluvberry, you accept these conditions. Please read them carefully.
          </p>
        </section>

        <section>
          <h2>1. Electronic Communications</h2>
          <p>
            When you visit Bluvberry or send e-mails to us, you are communicating with us electronically. 
            You consent to receive communications from us electronically. We will communicate with you by 
            e-mail or by posting notices on this site. You agree that all agreements, notices, disclosures 
            and other communications that we provide to you electronically satisfy any legal requirement 
            that such communications be in writing.
          </p>
        </section>

        <section>
          <h2>2. Copyright</h2>
          <p>
            All content included on this site, such as text, graphics, logos, button icons, images, 
            audio clips, digital downloads, data compilations, and software, is the property of Bluvberry 
            or its content suppliers and protected by international copyright laws.
          </p>
        </section>

        <section>
          <h2>3. License and Site Access</h2>
          <p>
            Bluvberry grants you a limited license to access and make personal use of this site and not 
            to download (other than page caching) or modify it, or any portion of it, except with express 
            written consent of Bluvberry.
          </p>
        </section>

        <section>
          <h2>4. Your Account</h2>
          <p>
            If you use this site, you are responsible for maintaining the confidentiality of your account 
            and password and for restricting access to your computer, and you agree to accept responsibility 
            for all activities that occur under your account or password.
          </p>
        </section>

        <section>
          <h2>5. Product Descriptions</h2>
          <p>
            Bluvberry and its affiliates attempt to be as accurate as possible. However, Bluvberry does not 
            warrant that product descriptions or other content of this site is accurate, complete, reliable, 
            current, or error-free.
          </p>
        </section>

        <section>
          <h2>6. Pricing</h2>
          <p>
            All prices are listed in Kenyan Shillings (KES). We reserve the right to change prices at any time. 
            Prices displayed include all applicable taxes unless otherwise stated.
          </p>
        </section>

        <section>
          <h2>7. Payment</h2>
          <p>
            We accept M-Pesa and other payment methods as displayed during checkout. By placing an order, 
            you authorize us to charge your selected payment method for the total order amount.
          </p>
        </section>

        <section>
          <h2>8. Contact Information</h2>
          <p>
            If you have any questions about these Conditions of Use, please contact us at{' '}
            <a href="mailto:support@bluvberry.com">support@bluvberry.com</a>
          </p>
        </section>

        <div className="legal-back">
          <Link to="/login">← Back to Sign In</Link>
        </div>
      </div>
    </div>
  )
}
