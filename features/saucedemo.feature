Feature: Sauce Demo

Background:
Given  I open the Sauce Demo login page 

@checkoutOperation
Scenario: E2E Scnarios- verify product shipped
When I logged in with username "standard_user" password "secret_sauce"
When I add product "Sauce Labs Backpack"
Then I perform checkout operation

@productSorting
Scenario: Verify product sort based on filter
When I logged in with username "standard_user" password "secret_sauce"
Then I verify Price sorted "lohi"





