  const icon_menu = document.querySelector(".close-custom")
         const nav = document.querySelector(".nav-custom nav");

        icon_menu.addEventListener('click' ,()=> {
            if(nav.style.display=='block'){
                nav.style.display="none"
               icon_menu.setAttribute("src", "./images/icon-menu.svg")
            }else{
                nav.style.display = "block"
                icon_menu.setAttribute("src", "./images/icon-close.svg")
            }
        });

        
  document.addEventListener("DOMContentLoaded", () => {
  document.querySelectorAll(".tabs").forEach(tabGroup => {
    const tabLinks = tabGroup.querySelectorAll(".tab-link");

    tabLinks.forEach(link => {
      link.addEventListener("click", () => {
        // remove active only within this group
        tabLinks.forEach(l => l.classList.remove("active"));
        tabGroup.parentElement.querySelectorAll(".tab-content").forEach(c => c.classList.remove("active"));
        // activate clicked
        link.classList.add("active");
        document.getElementById(link.dataset.tab).classList.add("active");
      });
    });
  });
});

document.getElementById("viewCartBtn").addEventListener("click", () => {
    // This line redirects to cart.html
    window.location.href = "cart.html";
  });

