Feature: Sauce Demo checkout
  As a shopper
  I want to complete checkout and verify order calculations
  So that the purchase flow is validated end to end

  Background:
    Given I open the Sauce Demo login page

  @checkout
  Scenario: Complete checkout for one item
    When I log in with username "standard_user" and password "secret_sauce"
    And I add the product "Sauce Labs Backpack" to the cart
    And I open the shopping cart
    And I start checkout
    And I enter shipping "Ada" "Lovelace" "94043"
    And I finish the order
    Then I should see the order confirmation

  @cart @totals
  Scenario: Add two items and verify totals on checkout overview
    When I log in with username "standard_user" and password "secret_sauce"
    Then I should see the inventory page
    And I add these products to the cart:
      | product               |
      | Sauce Labs Backpack   |
      | Sauce Labs Bike Light |
    And I open the shopping cart
    And I start checkout
    And I enter shipping "Ada" "Lovelace" "94043"
    Then the checkout overview totals should be correct

  @checkout @negative
  Scenario Outline: Checkout validation shows missing information errors
    When I log in with username "standard_user" and password "secret_sauce"
    And I add the product "Sauce Labs Backpack" to the cart
    And I open the shopping cart
    And I start checkout
    And I enter shipping "<firstName>" "<lastName>" "<postalCode>"
    Then I should see a checkout error containing "<errorText>"

    Examples:
      | firstName | lastName | postalCode | errorText                    |
      |           | Lovelace | 94043      | First Name is required       |
      | Ada       |           | 94043      | Last Name is required        |
      | Ada       | Lovelace |            | Postal Code is required      |
