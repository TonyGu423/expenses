require 'mongoid'
require 'csv'
require 'faker'

Mongoid.load!("./mongoid.yml", :development)

# Expense.first.user.createdAt
class Expense
  include Mongoid::Document
  field :description, type: String
  field :amount, type: Float
  field :createdAt, type: DateTime
  belongs_to :user, foreign_key: :owner
  belongs_to :category, foreign_key: :categories
end

class Category
  include Mongoid::Document
  field :name, type: String
  has_many :expenses
end

class User
  include Mongoid::Document
  field :username, type: String
  has_many :expenses
end

def start_csv_insert
  CSV.foreach("seed.csv") do |row|
      Expense.create(
        description: row[0],
        createdAt: DateTime.parse(row[1]),
        amount: row[2].gsub(/€/, '').strip.gsub(/,/, '.').to_f,
        categories: Category.where(name: row[3]).first.id,
        owner: User.where(username: 'michi').first.id
      )
  end
end

def start_faker_insert
  Expense.delete_all
  500.times do |x|
    Expense.create(
      description: Faker::Commerce.product_name,
      createdAt: Faker::Date.between(80.days.ago, Date.today),
      amount: Faker::Number.decimal(2),
      categories: Category.all.sample._id,
      owner: User.first.id
    )
  end
end
# insert
