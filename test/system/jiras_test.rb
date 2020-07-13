require "application_system_test_case"

class JirasTest < ApplicationSystemTestCase
  setup do
    @jira = jiras(:one)
  end

  test "visiting the index" do
    visit jiras_url
    assert_selector "h1", text: "Jiras"
  end

  test "creating a Jira" do
    visit jiras_url
    click_on "New Jira"

    click_on "Create Jira"

    assert_text "Jira was successfully created"
    click_on "Back"
  end

  test "updating a Jira" do
    visit jiras_url
    click_on "Edit", match: :first

    click_on "Update Jira"

    assert_text "Jira was successfully updated"
    click_on "Back"
  end

  test "destroying a Jira" do
    visit jiras_url
    page.accept_confirm do
      click_on "Destroy", match: :first
    end

    assert_text "Jira was successfully destroyed"
  end
end
