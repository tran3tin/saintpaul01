$(document).ready(function () {
  // Load Header
  $("#header-placeholder").load(
    "includes/header.html",
    function (response, status, xhr) {
      if (status == "error") {
        console.log(
          "Error loading header: " + xhr.status + " " + xhr.statusText
        );
      }
    }
  );

  // Load Sidebar
  $("#sidebar-placeholder").load(
    "includes/sidebar.html",
    function (response, status, xhr) {
      if (status == "error") {
        console.log(
          "Error loading sidebar: " + xhr.status + " " + xhr.statusText
        );
      } else {
        // Highlight active menu item
        var path = window.location.pathname;
        var page = path.split("/").pop();

        // If page is empty (e.g. root), default to index.html or whatever
        if (page === "") page = "index.html";

        // Find the link that matches the page
        var target = $('.sidebar-menu-content a[href="' + page + '"]');

        if (target.length > 0) {
          target.addClass("menu-active");
          // Add active class to the parent li of the link
          target.closest("li").addClass("active");

          // If it's a submenu item, expand the parent menu
          var parentSubMenu = target.closest(".sub-group-menu");
          if (parentSubMenu.length > 0) {
            parentSubMenu.addClass("sub-group-active");
            parentSubMenu.show(); // Ensure it's visible
            parentSubMenu.closest(".sidebar-nav-item").addClass("active");
          }
        }
      }
    }
  );
});
