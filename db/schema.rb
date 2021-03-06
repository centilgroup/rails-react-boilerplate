# This file is auto-generated from the current state of the database. Instead
# of editing this file, please use the migrations feature of Active Record to
# incrementally modify your database, and then regenerate this schema definition.
#
# This file is the source Rails uses to define your schema when running `rails
# db:schema:load`. When creating a new database, `rails db:schema:load` tends to
# be faster and is potentially less error prone than running all of your
# migrations from scratch. Old migrations may fail to apply correctly if those
# migrations use external dependencies or application code.
#
# It's strongly recommended that you check this file into your version control system.

ActiveRecord::Schema.define(version: 2021_07_19_131021) do

  # These are extensions that must be enabled in order to support this database
  enable_extension "plpgsql"

  create_table "active_storage_attachments", force: :cascade do |t|
    t.string "name", null: false
    t.string "record_type", null: false
    t.bigint "record_id", null: false
    t.bigint "blob_id", null: false
    t.datetime "created_at", null: false
    t.index ["blob_id"], name: "index_active_storage_attachments_on_blob_id"
    t.index ["record_type", "record_id", "name", "blob_id"], name: "index_active_storage_attachments_uniqueness", unique: true
  end

  create_table "active_storage_blobs", force: :cascade do |t|
    t.string "key", null: false
    t.string "filename", null: false
    t.string "content_type"
    t.text "metadata"
    t.bigint "byte_size", null: false
    t.string "checksum", null: false
    t.datetime "created_at", null: false
    t.index ["key"], name: "index_active_storage_blobs_on_key", unique: true
  end

  create_table "boards", force: :cascade do |t|
    t.string "board_id", null: false
    t.string "name"
    t.string "board_type"
    t.string "project_id", null: false
    t.json "column_config"
    t.bigint "user_id", null: false
    t.string "user_board_id", null: false
    t.json "sprints"
    t.index ["board_id"], name: "index_boards_on_board_id"
    t.index ["project_id"], name: "index_boards_on_project_id"
    t.index ["user_board_id"], name: "index_boards_on_user_board_id", unique: true
    t.index ["user_id"], name: "index_boards_on_user_id"
  end

  create_table "column_configurations", force: :cascade do |t|
    t.json "column_config"
    t.bigint "board_id"
    t.datetime "created_at", precision: 6, null: false
    t.datetime "updated_at", precision: 6, null: false
    t.json "column_issues_count"
    t.json "column_types_count"
    t.index ["board_id"], name: "index_column_configurations_on_board_id"
  end

  create_table "dora_metrics", force: :cascade do |t|
    t.json "base_metric"
    t.bigint "board_id", null: false
    t.datetime "created_at", precision: 6, null: false
    t.datetime "updated_at", precision: 6, null: false
    t.index ["board_id"], name: "index_dora_metrics_on_board_id"
  end

  create_table "issues", force: :cascade do |t|
    t.string "user_issue_id", null: false
    t.string "project_id", null: false
    t.string "issue_id", null: false
    t.string "key"
    t.text "summary"
    t.json "status"
    t.bigint "user_id", null: false
    t.json "issue_type"
    t.string "epic_link"
    t.string "epic_name"
    t.date "due_date"
    t.json "change_log"
    t.date "created"
    t.integer "time_to_close_in_days"
    t.json "status_transitions"
    t.index ["issue_id"], name: "index_issues_on_issue_id"
    t.index ["project_id"], name: "index_issues_on_project_id"
    t.index ["user_id"], name: "index_issues_on_user_id"
    t.index ["user_issue_id"], name: "index_issues_on_user_issue_id", unique: true
  end

  create_table "jiras", force: :cascade do |t|
    t.datetime "created_at", precision: 6, null: false
    t.datetime "updated_at", precision: 6, null: false
  end

  create_table "projects", force: :cascade do |t|
    t.string "user_project_id", null: false
    t.string "project_id", null: false
    t.string "key"
    t.string "name"
    t.bigint "user_id", null: false
    t.date "end_date"
    t.json "versions"
    t.index ["project_id"], name: "index_projects_on_project_id"
    t.index ["user_id"], name: "index_projects_on_user_id"
    t.index ["user_project_id"], name: "index_projects_on_user_project_id", unique: true
  end

  create_table "users", force: :cascade do |t|
    t.string "email", default: "", null: false
    t.string "encrypted_password", default: "", null: false
    t.string "reset_password_token"
    t.datetime "reset_password_sent_at"
    t.datetime "remember_created_at"
    t.datetime "created_at", precision: 6, null: false
    t.datetime "updated_at", precision: 6, null: false
    t.string "otp_secret_key"
    t.boolean "two_factor_auth", default: false
    t.string "first_name"
    t.string "last_name"
    t.string "username"
    t.string "company_name"
    t.string "jira_url"
    t.string "api_version"
    t.string "jira_username"
    t.string "jira_password"
    t.json "min_max"
    t.json "sortable_items"
    t.boolean "initial_config"
    t.boolean "wip"
    t.boolean "gauge"
    t.boolean "focus"
    t.boolean "vpi"
    t.boolean "activities"
    t.boolean "vsm"
    t.integer "initial_config_step"
    t.boolean "dora"
    t.index ["email"], name: "index_users_on_email", unique: true
    t.index ["reset_password_token"], name: "index_users_on_reset_password_token", unique: true
  end

  add_foreign_key "active_storage_attachments", "active_storage_blobs", column: "blob_id"
  add_foreign_key "boards", "users"
  add_foreign_key "column_configurations", "boards"
  add_foreign_key "dora_metrics", "boards"
  add_foreign_key "issues", "users"
  add_foreign_key "projects", "users"
end
