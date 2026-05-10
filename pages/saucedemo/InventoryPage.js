import { expect } from '@playwright/test'

export class InventoryPage
{

    constructor(page)
    {
        this.page= page;

        this.title = page.locator('[data-test="title"]');
        this.inventoryItems = page.locator('[data-test="inventory-item"]');
        this.cardBadge = page.locator('.shopping_cart_badge');
        this.filterContainer = page.locator('[data-test="product-sort-container"]');
        this.productFilter = page.locator('.product_sort_container');
    }

    //action 

    async selectFilter(filterOption)
    {
       await  this.productFilter.selectOption(filterOption);
     
    }

    //assertions


    async verifyProductSortedAccordingToFilter(filterOption)
    {
       await  this.selectFilter(filterOption);
       const count = await this.inventoryItems.count();
       const actualPrices = [] ;
       for(let i=0;i<count;i++)
       {
        const item = await this.inventoryItems.nth(i);
        const priceText = await item.locator('.inventory_item_price').textContent();
        const price =  Number(priceText.replace('$', '').trim());
        console.log('priceText', price);
        actualPrices.push(price);
       }
      const expectedPrices =  actualPrices.slice().sort((a, b )=> a-b)

      expect(actualPrices).toEqual(expectedPrices);
    }


    async verifyCardBadgeCountZero()
    {
       await  expect(this.cardBadge).toHaveCount(0);
       await  expect(this.cardBadge).toBeHidden();
    }

   async addToCartByProductName(productName)
    {
       const item = this.inventoryItems.filter({hasText: productName });
       await item.getByRole('button', { name: 'Add to cart' }).click();

    }

    async verifyCardBadgeCount(count)
    {
       await  expect(this.cardBadge).toHaveText(count);
    }

    async epxectPageUrl(url) {
        expect(this.page).toHaveURL(url);
    }


}