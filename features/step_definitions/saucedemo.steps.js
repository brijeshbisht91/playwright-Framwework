import { Given, When, Then } from "@cucumber/cucumber";
import { SauceLoginPage } from "../../pages/saucedemo/LoginPage";


Given('I open the Sauce Demo login page', async function() {

  const login =   new SauceLoginPage(this.page);
  await login.open();
    
})

Given('I logged in with username {string} password {string}', async function(username, password ) {

    const login = new SauceLoginPage(this.page);
    await login.login(username, password)
      
  })