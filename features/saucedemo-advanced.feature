Feature: Sauce Demo advanced scenarios
  Higher coverage SauceDemo flows using data-driven tests.

  Background:
    Given I open the Sauce Demo login page

  @login @dataDriven
  Scenario Outline: Login with different accepted users
    When I log in with username "<username>" and password "<password>"
    Then I should see the inventory page

    Examples:
      | username               | password     |
      | standard_user          | secret_sauce |
      | problem_user           | secret_sauce |
      | performance_glitch_user| secret_sauce |
      | error_user             | secret_sauce |
      | visual_user            | secret_sauce |

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

  @links
  Scenario: Verify inventory page links are not broken (same origin)
    When I log in with username "standard_user" and password "secret_sauce"
    Then I should see the inventory page
    Then all links on the inventory page should be reachable

  @ui @color
  Scenario: Login error banner should have expected color
    When I log in with username "locked_out_user" and password "secret_sauce"
    Then I should see a login error containing "locked out"
    And the login error banner background color should be "rgb(226, 35, 26)"

  @logout
  Scenario: User can logout from inventory page
    When I log in with username "standard_user" and password "secret_sauce"
    Then I should see the inventory page
    When I logout from the application
    Then I should be on the login page

  @reset
  Scenario: Reset app state clears the cart
    When I log in with username "standard_user" and password "secret_sauce"
    Then I should see the inventory page
    And I add the product "Sauce Labs Backpack" to the cart
    Then the cart should show badge count 1
    When I reset the app state
    Then the cart badge should not be visible
