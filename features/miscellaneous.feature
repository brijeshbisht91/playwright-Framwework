Feature: Sauce Demo miscellaneous state checks
  As a tester
  I want to verify storage and application state behavior
  So that persistence and reset flows work correctly

  Background:
    Given I open the Sauce Demo login page

  @storage
  Scenario: Cart state persists after page refresh
    When I log in with username "standard_user" and password "secret_sauce"
    And I add the product "Sauce Labs Backpack" to the cart
    And I refresh the page
    Then the cart should show badge count 1

  @storage @security
  Scenario: Inventory access is blocked after logout
    When I log in with username "standard_user" and password "secret_sauce"
    Then I should see the inventory page
    When I logout from the application
    And I open the inventory page directly
    Then I should be redirected to the login page

  @reset
  Scenario: Reset app state clears the cart
    When I log in with username "standard_user" and password "secret_sauce"
    Then I should see the inventory page
    And I add the product "Sauce Labs Backpack" to the cart
    Then the cart should show badge count 1
    When I reset the app state
    Then the cart badge should not be visible
