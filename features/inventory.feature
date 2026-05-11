Feature: Sauce Demo inventory and cart
  As a shopper
  I want to browse inventory, filter items, and use the cart
  So that I can validate the product catalog and inventory actions

  Background:
    Given I open the Sauce Demo login page

  @inventory @sort
  Scenario Outline: Verify product filter functionality
    When I log in with username "<username>" and password "<password>"
    Then I should see the inventory page
    And I filter the products by "<filterType>"

    Examples:
      | username      | password     | filterType            |
      | standard_user | secret_sauce | Price (low to high)   |
      | standard_user | secret_sauce | Price (high to low)   |
      | standard_user | secret_sauce | Name (A to Z)         |
      | standard_user | secret_sauce | Name (Z to A)         |

  @inventory @links
  Scenario: Verify inventory page links are not broken (same origin)
    When I log in with username "standard_user" and password "secret_sauce"
    Then I should see the inventory page
    Then all links on the inventory page should be reachable

  @inventory @cart
  Scenario: Add Sauce Labs Backpack to cart
    When I log in with username "standard_user" and password "secret_sauce"
    And I add the product "Sauce Labs Backpack" to the cart
    Then the cart should show badge count 1

  @inventory @session
  Scenario: User can logout from inventory page
    When I log in with username "standard_user" and password "secret_sauce"
    Then I should see the inventory page
    When I logout from the application
    Then I should be on the login page
