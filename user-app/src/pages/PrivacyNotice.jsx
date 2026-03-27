import { Link } from 'react-router-dom'

export default function PrivacyNotice() {
  return (
    <div className="legal-page">
      <div className="legal-container">
        <h1>Bluvberry Privacy Notice</h1>
        <p className="last-updated">Last updated: January 10, 2026</p>

        <section>
          <h2>Introduction</h2>
          <p>
            Bluvberry knows that you care how information about you is used and shared, and we appreciate 
            your trust that we will do so carefully and sensibly. This Privacy Notice describes how we 
            collect and process your personal information through Bluvberry websites, devices, products, 
            and services.
          </p>
        </section>

        <section>
          <h2>What Personal Information Does Bluvberry Collect?</h2>
          <p>We collect your personal information in order to provide and continually improve our products and services.</p>
          <ul>
            <li><strong>Information You Give Us:</strong> We receive and store any information you provide in relation to Bluvberry services. This includes your name, email address, phone number, and payment information.</li>
            <li><strong>Automatic Information:</strong> We automatically collect and store certain types of information about your use of Bluvberry services, including information about your interaction with content and services.</li>
            <li><strong>Information from Other Sources:</strong> We might receive information about you from other sources, such as delivery and address information.</li>
          </ul>
        </section>

        <section>
          <h2>For What Purposes Does Bluvberry Use Your Personal Information?</h2>
          <p>We use your personal information to:</p>
          <ul>
            <li>Process and deliver your orders</li>
            <li>Communicate with you about orders, products, services, and promotional offers</li>
            <li>Provide, troubleshoot, and improve Bluvberry services</li>
            <li>Recommend products and services that might interest you</li>
            <li>Prevent fraud and abuse</li>
            <li>Comply with legal obligations</li>
          </ul>
        </section>

        <section>
          <h2>What About Cookies?</h2>
          <p>
            We use cookies and similar technologies to enable our services, understand how customers use 
            our services, and improve their experience. This includes storing your preferences and login information.
          </p>
        </section>

        <section>
          <h2>Does Bluvberry Share Your Personal Information?</h2>
          <p>
            Information about our customers is an important part of our business, and we are not in the 
            business of selling our customers' personal information to others. We share customer information 
            only as described below:
          </p>
          <ul>
            <li><strong>Third-Party Service Providers:</strong> We employ other companies to perform functions on our behalf (e.g., M-Pesa for payment processing).</li>
            <li><strong>Business Transfers:</strong> As we continue to develop our business, we might sell or buy other businesses or services.</li>
            <li><strong>Protection of Bluvberry and Others:</strong> We release account and other personal information when we believe release is appropriate to comply with the law.</li>
          </ul>
        </section>

        <section>
          <h2>How Secure Is Information About Me?</h2>
          <p>
            We design our systems with your security and privacy in mind. We use encryption protocols 
            and software to protect the security of your personal information during transmission. 
            We maintain physical, electronic, and procedural safeguards in connection with the collection, 
            storage, and disclosure of customer personal information.
          </p>
        </section>

        <section>
          <h2>What Choices Do I Have?</h2>
          <p>
            You can choose not to provide certain information, but then you might not be able to take 
            advantage of many of our Bluvberry features. You can add or update certain information on 
            pages such as those referenced in Your Account.
          </p>
        </section>

        <section>
          <h2>Contact Information</h2>
          <p>
            If you have any questions about our Privacy Notice, please contact us at{' '}
            <a href="mailto:privacy@bluvberry.com">privacy@bluvberry.com</a>
          </p>
        </section>

        <div className="legal-back">
          <Link to="/login">← Back to Sign In</Link>
        </div>
      </div>
    </div>
  )
}
