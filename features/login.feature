Feature: Sauce Demo login
  As a user
  I want to authenticate successfully and see appropriate login errors
  So that I can access the application securely

  Background:
    Given I open the Sauce Demo login page

  @login
  Scenario: Successful login with standard user
    When I log in with username "standard_user" and password "secret_sauce"
    Then I should see the inventory page

  @login @negative
  Scenario: Locked out user sees an error
    When I log in with username "locked_out_user" and password "secret_sauce"
    Then I should see a login error containing "locked out"

  @login @dataDriven
  Scenario Outline: Login smoke for accepted users
    When I log in with username "<user>" and password "secret_sauce"
    Then I should see the inventory page

    Examples:
      | user                    |
      | standard_user           |
      | problem_user            |
      | performance_glitch_user |

  @ui @color
  Scenario: Login error banner should have expected color
    When I log in with username "locked_out_user" and password "secret_sauce"
    Then I should see a login error containing "locked out"
    And the login error banner background color should be "rgb(226, 35, 26)"
