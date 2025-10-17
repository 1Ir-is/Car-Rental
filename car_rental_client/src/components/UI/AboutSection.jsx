import React from "react";
import { Container, Row, Col } from "reactstrap";
import "../../styles/about-section.css";
import aboutImg from "../../assets/all-images/cars-img/bmw-offer.png";

const AboutSection = ({ aboutClass }) => {
  return (
    <section
      className="about__section"
      style={
        aboutClass === "aboutPage"
          ? { marginTop: "0px" }
          : { marginTop: "280px" }
      }
    >
      <Container>
        <Row>
          <Col lg="6" md="6">
            <div className="about__section-content">
              <h4 className="section__subtitle">About Us</h4>
              <h2 className="section__title">Welcome to car rent service</h2>
              <p className="section__description">
                Experience the convenience of car rental at your fingertips. Our
                premium car rental service offers a wide range of vehicles to
                meet your travel needs. Whether it's for business trips, family
                vacations, or daily commutes, we provide reliable and affordable
                transportation solutions with exceptional customer service.
              </p>

              <div className="about__section-item d-flex align-items-center">
                <p className="section__description d-flex align-items-center gap-2">
                  <i class="ri-checkbox-circle-line"></i> Wide variety of
                  premium vehicles
                </p>

                <p className="section__description d-flex align-items-center gap-2">
                  <i class="ri-checkbox-circle-line"></i> 24/7 customer support
                  service
                </p>
              </div>

              <div className="about__section-item d-flex align-items-center">
                <p className="section__description d-flex align-items-center gap-2">
                  <i class="ri-checkbox-circle-line"></i> Easy booking &
                  flexible rental periods
                </p>

                <p className="section__description d-flex align-items-center gap-2">
                  <i class="ri-checkbox-circle-line"></i> Competitive pricing &
                  transparent fees
                </p>
              </div>

              <div className="mobile__app-section mt-4">
                <h5 className="section__subtitle">Download Our Mobile App</h5>
                <p className="section__description mb-3">
                  Get our mobile app for the ultimate car rental experience.
                  Book, manage, and track your rentals on the go!
                </p>
                <div className="app__download-buttons d-flex gap-3">
                  <button className="app__store-btn border-0 bg-transparent p-0">
                    <img
                      src="https://upload.wikimedia.org/wikipedia/commons/7/78/Google_Play_Store_badge_EN.svg"
                      alt="Get it on Google Play"
                      style={{ height: "50px", cursor: "pointer" }}
                    />
                  </button>
                  <button className="app__store-btn border-0 bg-transparent p-0">
                    <img
                      src="https://upload.wikimedia.org/wikipedia/commons/3/3c/Download_on_the_App_Store_Badge.svg"
                      alt="Download on the App Store"
                      style={{ height: "50px", cursor: "pointer" }}
                    />
                  </button>
                </div>
              </div>
            </div>
          </Col>

          <Col lg="6" md="6">
            <div className="about__img">
              <img src={aboutImg} alt="" className="w-100" />
            </div>
          </Col>
        </Row>
      </Container>
    </section>
  );
};

export default AboutSection;
