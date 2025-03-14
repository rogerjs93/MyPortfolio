document.addEventListener('DOMContentLoaded', function() {
    // Mobile navigation toggle
    const navToggle = document.querySelector('.nav-toggle');
    const navLinks = document.querySelector('.nav-links');
    
    if (navToggle) {
        navToggle.addEventListener('click', function() {
            navLinks.classList.toggle('active');
            navToggle.classList.toggle('active');
        });
    }

    // Smooth scrolling for navigation links
    document.querySelectorAll('a[href^="#"]').forEach(anchor => {
        anchor.addEventListener('click', function(e) {
            e.preventDefault();
            
            const targetId = this.getAttribute('href');
            const targetElement = document.querySelector(targetId);
            
            if (targetElement) {
                window.scrollTo({
                    top: targetElement.offsetTop - 70,
                    behavior: 'smooth'
                });
                
                // Close mobile menu if open
                if (navLinks.classList.contains('active')) {
                    navLinks.classList.remove('active');
                    navToggle.classList.remove('active');
                }
            }
        });
    });

    // Add current year to footer
    document.getElementById('year').textContent = new Date().getFullYear();

    // Add experience data dynamically
    addExperienceData();
    
    // Add certification data dynamically
    addCertificationData();
    
    // Navbar scroll effect
    window.addEventListener('scroll', function() {
        const nav = document.querySelector('.nav-container');
        if (window.scrollY > 100) {
            nav.style.backgroundColor = 'white';
            nav.style.boxShadow = '0 2px 10px rgba(0, 0, 0, 0.1)';
        } else {
            nav.style.backgroundColor = 'rgba(255, 255, 255, 0.95)';
            nav.style.boxShadow = '0 2px 10px rgba(0, 0, 0, 0.05)';
        }
    });
    
    // Form submission handling
    const contactForm = document.querySelector('.contact-form');
    if (contactForm) {
        contactForm.addEventListener('submit', function(e) {
            e.preventDefault();
            // In a real scenario, you would send the form data to a server
            // For now, we'll just simulate a successful submission
            
            const formData = {
                name: this.querySelector('#name').value,
                email: this.querySelector('#email').value,
                message: this.querySelector('#message').value
            };
            
            console.log('Form submitted:', formData);
            
            // Show success message
            alert('Message sent successfully! I will get back to you soon.');
            
            // Reset form
            this.reset();
        });
    }
});

// Experience data with actual information
function addExperienceData() {
    const timelineContainer = document.querySelector('.timeline');
    if (!timelineContainer) return;
    
    // Actual experience data from LinkedIn profile
    const experiences = [
        {
            position: "Freelance",
            company: "Upwork",
            period: "January 2017 - Present",
            description: "UI/UX design, document translations (English-Spanish), Data analysis and processing. 3D character animation and creation.",
            side: "left"
        },
        {
            position: "UI programmer",
            company: "Naama.Online",
            period: "August 2024 - November 2024",
            description: "Working as a UI programmer for Naama.Online.",
            side: "right"
        },
        {
            position: "Courier Partner",
            company: "Wolt",
            period: "April 2022 - November 2024",
            description: "Working as a Courier Partner for Wolt in Turku, Southwest Finland.",
            side: "left"
        },
        {
            position: "Company Owner",
            company: "Wellness Salas",
            period: "August 2020 - January 2024",
            description: "Running Wellness Salas in Turku, Finland.",
            side: "right"
        },
        {
            position: "Sales Development Representative",
            company: "Vaadin",
            period: "February 2023",
            description: "Worked as a Sales Development Representative at Vaadin in Turku, Southwest Finland.",
            side: "left"
        },
        {
            position: "Certified Personal Fitness Trainer",
            company: "Autónomo",
            period: "January 2015 - January 2017",
            description: "Worked as a Certified Personal Fitness Trainer in Costa Rica.",
            side: "right"
        },
        {
            position: "Emergency Technician",
            company: "Hospital Jerusalem",
            period: "October 2014 - October 2015",
            description: "Served as an Emergency Technician at Hospital Jerusalem in Costa Rica.",
            side: "left"
        },
        {
            position: "Accounting Assistant",
            company: "Hospital Jerusalem",
            period: "August 2013 - October 2014",
            description: "Worked as an Accounting Assistant at Hospital Jerusalem in Costa Rica.",
            side: "right"
        }
    ];
    
    experiences.forEach(exp => {
        const timelineItem = document.createElement('div');
        timelineItem.classList.add('timeline-item', `timeline-item-${exp.side}`);
        
        timelineItem.innerHTML = `
            <div class="timeline-content">
                <span class="timeline-date">${exp.period}</span>
                <h3 class="timeline-title">${exp.position}</h3>
                <p class="timeline-company">${exp.company}</p>
                <p>${exp.description}</p>
            </div>
        `;
        
        timelineContainer.appendChild(timelineItem);
    });
}

// Certification data with actual information
function addCertificationData() {
    const certificationGrid = document.querySelector('.certification-grid');
    if (!certificationGrid) return;
    
    // Actual certification data from LinkedIn profile
    const certifications = [
        {
            title: "Foundations: Data, Data, Everywhere",
            issuer: "Google",
            date: "2023",
            image: "assets/cert1.jpg" 
        },
        {
            title: "Building AI Applications With Haystack",
            issuer: "deepset",
            date: "2023",
            image: "assets/cert2.jpg"
        },
        {
            title: "Building and Evaluating Advanced RAG",
            issuer: "deepset",
            date: "2023",
            image: "assets/cert3.jpg"
        },
        {
            title: "Ingles Basico",
            issuer: "",
            date: "2022",
            image: "assets/cert4.jpg"
        }
    ];
    
    certifications.forEach(cert => {
        const certCard = document.createElement('div');
        certCard.classList.add('certification-card');
        
        certCard.innerHTML = `
            <div class="certification-body">
                <h3 class="certification-title">${cert.title}</h3>
                <p class="certification-issuer">${cert.issuer}</p>
                <p class="certification-date">${cert.date}</p>
            </div>
        `;
        
        certificationGrid.appendChild(certCard);
    });
}