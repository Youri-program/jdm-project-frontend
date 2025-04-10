document.addEventListener("DOMContentLoaded", () => {
    const welcomeEl = document.getElementById("welcome-message");
  
    const username = localStorage.getItem("username") || "Guest";
  
    const hour = new Date().getHours();
    let greeting = "Hello";
  
    if (hour >= 5 && hour < 12) greeting = "Good morning";
    else if (hour >= 12 && hour < 17) greeting = "Good afternoon";
    else if (hour >= 17 && hour < 22) greeting = "Good evening";
    else greeting = "Good night";
  
    const name = username.charAt(0).toUpperCase() + username.slice(1);
  
    welcomeEl.textContent = `${greeting}, ${name} 👋`;
});
  