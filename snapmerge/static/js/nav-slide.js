const navSlide = () => {
    const burger = document.querySelector(".burger");
    const nav = document.querySelector(".navlinks");
    const navLinks = document.querySelectorAll(".navlinks li");

    // Toggle
    burger.addEventListener('click', () => {
        nav.classList.toggle('nav-active');
        
        
        //Fade
        navLinks.forEach((link, index) => {
            if (link.style.animation) {
                link.style.animation = ``;
            } else {
                link.style.animation = `navLinkFade 0.5s ease forwards ${index / 5 + 0.5}s`;
            }
        });
        // Burger Animation
        burger.classList.toggle('toggle');
    });


}


navSlide();

