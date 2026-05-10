import { expect } from "@playwright/test";

export class CheckoutPage {

    constructor(page) {
        this.page = page;


        this.cartlink = page.locator('.shopping_cart_link');
        this.cartItems = page.locator('.cart_item');
        this.checkoutButton = page.locator('#checkout');


        this.firstName = page.locator('#first-name');
        this.lastName = page.locator('#last-name');
        this.zipcode = page.locator('#postal-code');
        this.continueButton = page.locator('#continue');
        this.finistButton = page.locator('#finish');
        this.completeHeader = page.locator('.complete-header');

    }

    //action 

    async openCart() {
      await this.cartlink.click();
    }


    async startCheckout() {
        await this.checkoutButton.click();
    }

    async fillShipping(firstName, lastName, zipcode) {
        await this.firstName.fill(firstName);
        await this.lastName.fill(lastName);
        await this.zipcode.fill(zipcode);
        await this.continueButton.click();
    }

    async finishOrder() {
        await this.finistButton.click();
    }


    //assertion
    async epxectOnCardPage() {
        await expect(this.page).toHaveURL('https://www.saucedemo.com/checkout-complete.html');
    }

    async epxectOrderComplete() {
        await expect(this.completeHeader).toContainText('Thank you for your order!');
    }


}