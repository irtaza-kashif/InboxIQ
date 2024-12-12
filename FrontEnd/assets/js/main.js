/*===== MENU SHOW Y HIDDEN =====*/ 

const navMenu = document.getElementById('nav-menu'),
    toggleMenu = document.getElementById('nav-toggle'),
    closeMenu = document.getElementById('nav-close'),
    contentStuff = document.getElementById('mainContent');

/* SHOW */ 
toggleMenu.addEventListener('click', () => {
    navMenu.classList.toggle('show');
    if (navMenu.classList.contains('show')) {
        contentStuff.style.display = 'none';  // Hide the main content
    } else {
        contentStuff.style.display = 'flex';   // Show the main content
    }
    console.log('Toggle button clicked'); // Debug log

});

/* HIDDEN */
closeMenu.addEventListener('click', () => {
    console.log('Close button clicked'); // Debug log
    navMenu.classList.remove('show');
    contentStuff.style.display = 'flex';       // Show the main content
});

/*===== ACTIVE AND REMOVE MENU =====*/
const navLink = document.querySelectorAll('.nav__link');   

function linkAction() {
    navLink.forEach(n => n.classList.remove('active'));
    this.classList.add('active');
    navMenu.classList.remove('show');
    contentStuff.style.display = 'flex';  // Show the main content
}

navLink.forEach(n => n.addEventListener('click', linkAction));
