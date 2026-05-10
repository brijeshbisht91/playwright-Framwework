import { Given, When, Then } from "@cucumber/cucumber";
import { LoginPage } from "../../pages/saucedemo/LoginPage.js";
import { InventoryPage } from "../../pages/saucedemo/InventoryPage.js";
import { CheckoutPage } from "../../pages/saucedemo/CheckoutPage.js";


Given('I open the Sauce Demo login page', async function() {

  const login =  new LoginPage(this.page);
  await login.open();
    
})

Given('I logged in with username {string} password {string}', async function(username, password ) {

    const login = new LoginPage(this.page);
    await login.login(username, password)
      
  })

  Then('I verify page url as {string}', async function(url)
  {
    const inventory = new InventoryPage(this.page);
    await inventory.epxectPageUrl(url);
  })

  When('I add product {string}', async function(productName)
  {
    const inventory = new InventoryPage(this.page);
    await inventory.addToCartByProductName(productName)
    await  inventory.verifyCardBadgeCount("1");

  
  });

  Then('I perform checkout operation', async function()
  {
    const checkoutPage = new CheckoutPage(this.page);
    await checkoutPage.openCart();
    await checkoutPage.startCheckout();

    await checkoutPage.fillShipping("Chandan", "sharma", "122001");
    await checkoutPage.finishOrder();
    await checkoutPage.epxectOnCardPage();
    await checkoutPage.epxectOrderComplete();

  });

  Then('I verify Price sorted {string}', async function(filter)
  {
   const inventory=new InventoryPage(this.page);
   await inventory.verifyProductSortedAccordingToFilter(filter);

  });