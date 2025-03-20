import React, { useState, useEffect } from 'react';
import { MEAL_TYPES, DAYS_OF_WEEK } from '../constants/options';
import { Calendar, Coffee, Utensils, Moon, Edit, Plus, AlertCircle } from 'lucide-react';

interface MenuItem {
  id: string;
  name: string;
  description: string;
  isVeg: boolean;
}

interface MealMenu {
  items: MenuItem[];
}

interface DayMenu {
  [key: string]: MealMenu;
}

interface WeeklyMenu {
  [key: string]: DayMenu;
}

const DailyMenu = () => {
  const [weeklyMenu, setWeeklyMenu] = useState<WeeklyMenu>({});
  const [selectedDay, setSelectedDay] = useState(new Date().toLocaleString('en-US', { weekday: 'long' }));
  const [selectedMeal, setSelectedMeal] = useState(MEAL_TYPES[0].value);
  const [editMode, setEditMode] = useState(false);
  const [newItem, setNewItem] = useState({ name: '', description: '', isVeg: true });
  const [statusMessage, setStatusMessage] = useState<{message: string, type: 'success' | 'error'} | null>(null);

  useEffect(() => {
    const savedMenu = localStorage.getItem('weeklyMenu');
    if (savedMenu) {
      try {
        const parsedMenu = JSON.parse(savedMenu);
        setWeeklyMenu(parsedMenu);
      } catch (error) {
        console.error('Error parsing menu data:', error);
        setStatusMessage({
          message: 'Failed to load menu data',
          type: 'error'
        });
      }
    }
  }, []);

  const saveMenu = (updatedMenu: WeeklyMenu) => {
    try {
      localStorage.setItem('weeklyMenu', JSON.stringify(updatedMenu));
      setWeeklyMenu(updatedMenu);
      setStatusMessage({
        message: 'Menu updated successfully',
        type: 'success'
      });
      setTimeout(() => setStatusMessage(null), 3000);
    } catch (error) {
      console.error('Error saving menu:', error);
      setStatusMessage({
        message: 'Failed to save menu',
        type: 'error'
      });
    }
  };

  const addMenuItem = () => {
    if (!newItem.name) return;

    // Create a deep copy of the weekly menu
    const updatedMenu = { ...weeklyMenu };
    
    // Ensure the day and meal structure exists
    if (!updatedMenu[selectedDay]) {
      updatedMenu[selectedDay] = {};
    }
    
    if (!updatedMenu[selectedDay][selectedMeal]) {
      updatedMenu[selectedDay][selectedMeal] = { items: [] };
    }
    
    // Add the new item
    updatedMenu[selectedDay][selectedMeal].items = [
      ...(updatedMenu[selectedDay][selectedMeal].items || []),
      {
        id: Date.now().toString(),
        ...newItem
      }
    ];

    // Update the menu
    saveMenu(updatedMenu);
    setNewItem({ name: '', description: '', isVeg: true });
  };

  const removeMenuItem = (itemId: string) => {
    // Create a deep copy of the weekly menu
    const updatedMenu = { ...weeklyMenu };
    
    // Make sure the path exists
    if (updatedMenu[selectedDay] && 
        updatedMenu[selectedDay][selectedMeal] && 
        updatedMenu[selectedDay][selectedMeal].items) {
      
      // Filter out the item to remove
      updatedMenu[selectedDay][selectedMeal].items = updatedMenu[selectedDay][selectedMeal].items.filter(
        (item: MenuItem) => item.id !== itemId
      );
      
      // Update the menu
      saveMenu(updatedMenu);
    }
  };

  const getMealIcon = (mealType: string) => {
    switch (mealType) {
      case 'breakfast':
        return <Coffee className="h-6 w-6 text-orange-500" />;
      case 'lunch':
        return <Utensils className="h-6 w-6 text-blue-500" />;
      case 'dinner':
        return <Moon className="h-6 w-6 text-purple-500" />;
      default:
        return <Utensils className="h-6 w-6 text-gray-500" />;
    }
  };

  const getMealStyle = (mealType: string) => {
    switch (mealType) {
      case 'breakfast':
        return 'bg-orange-50';
      case 'lunch':
        return 'bg-blue-50';
      case 'dinner':
        return 'bg-purple-50';
      default:
        return 'bg-gray-50';
    }
  };

  const getCurrentMenuItems = (): MenuItem[] => {
    if (weeklyMenu && 
        weeklyMenu[selectedDay] && 
        weeklyMenu[selectedDay][selectedMeal] && 
        Array.isArray(weeklyMenu[selectedDay][selectedMeal].items)) {
      return weeklyMenu[selectedDay][selectedMeal].items;
    }
    return [];
  };

  return (
    <div className="max-w-4xl mx-auto p-6">
      <div className="flex justify-between items-center mb-8">
        <div>
          <h2 className="text-3xl font-bold text-gray-900">Mess Menu</h2>
          <p className="mt-2 text-gray-600">
            <Calendar className="inline-block mr-2 h-5 w-5" />
            View and edit mess menu
          </p>
        </div>
        <button
          onClick={() => setEditMode(!editMode)}
          className="inline-flex items-center px-4 py-2 bg-orange-600 text-white rounded-md hover:bg-orange-700"
        >
          <Edit className="h-5 w-5 mr-2" />
          {editMode ? 'View Mode' : 'Edit Mode'}
        </button>
      </div>

      {/* Status Message */}
      {statusMessage && (
        <div className={`mb-4 p-3 rounded-md ${
          statusMessage.type === 'success' ? 'bg-green-50 text-green-800' : 'bg-red-50 text-red-800'
        }`}>
          <div className="flex items-center">
            {statusMessage.type === 'error' && <AlertCircle className="h-5 w-5 mr-2" />}
            {statusMessage.message}
          </div>
        </div>
      )}

      {/* Day Selection */}
      <div className="mb-8">
        <div className="grid grid-cols-2 md:grid-cols-7 gap-2">
          {DAYS_OF_WEEK.map((day) => (
            <button
              key={day}
              onClick={() => setSelectedDay(day)}
              className={`py-3 px-2 rounded-lg text-center transition-all ${
                selectedDay === day
                  ? 'bg-orange-600 text-white font-medium shadow-md'
                  : 'bg-white text-gray-700 hover:bg-gray-50 border border-gray-200'
              }`}
            >
              {day}
            </button>
          ))}
        </div>
      </div>

      {/* Meal Type Selection */}
      <div className="mb-8">
        <div className="grid grid-cols-3 gap-4">
          {MEAL_TYPES.map((meal) => (
            <button
              key={meal.value}
              onClick={() => setSelectedMeal(meal.value)}
              className={`p-4 rounded-lg flex flex-col items-center justify-center transition-all ${
                selectedMeal === meal.value
                  ? 'bg-gray-800 text-white'
                  : 'bg-white text-gray-700 hover:bg-gray-50 border border-gray-200'
              }`}
            >
              {getMealIcon(meal.value)}
              <span className="mt-2 font-medium">{meal.label}</span>
              <span className="text-sm opacity-75">{meal.time}</span>
            </button>
          ))}
        </div>
      </div>

      {/* Edit Form */}
      {editMode && (
        <div className="mb-8 bg-white p-6 rounded-lg shadow-sm border border-gray-200">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
            <input
              type="text"
              placeholder="Item name"
              className="w-full rounded-md border-gray-300 shadow-sm focus:border-orange-500 focus:ring-orange-500"
              value={newItem.name}
              onChange={(e) => setNewItem({ ...newItem, name: e.target.value })}
            />
            <input
              type="text"
              placeholder="Description (optional)"
              className="w-full rounded-md border-gray-300 shadow-sm focus:border-orange-500 focus:ring-orange-500"
              value={newItem.description}
              onChange={(e) => setNewItem({ ...newItem, description: e.target.value })}
            />
          </div>
          <div className="flex items-center justify-between">
            <label className="flex items-center">
              <input
                type="checkbox"
                className="rounded border-gray-300 text-orange-600 focus:ring-orange-500"
                checked={newItem.isVeg}
                onChange={(e) => setNewItem({ ...newItem, isVeg: e.target.checked })}
              />
              <span className="ml-2">Vegetarian</span>
            </label>
            <button
              onClick={addMenuItem}
              className="inline-flex items-center px-4 py-2 bg-orange-600 text-white rounded-md hover:bg-orange-700"
            >
              <Plus className="h-5 w-5 mr-2" />
              Add Item
            </button>
          </div>
        </div>
      )}

      {/* Menu Display */}
      <div className="bg-white rounded-lg shadow-lg overflow-hidden">
        <div className={`p-4 flex items-center gap-3 ${getMealStyle(selectedMeal)}`}>
          {getMealIcon(selectedMeal)}
          <div>
            <h3 className="text-xl font-semibold text-gray-900">
              {MEAL_TYPES.find(m => m.value === selectedMeal)?.label}
            </h3>
            <p className="text-sm text-gray-600">
              {MEAL_TYPES.find(m => m.value === selectedMeal)?.time}
            </p>
          </div>
        </div>

        <div className="p-6">
          {getCurrentMenuItems().length > 0 ? (
            <div className="grid gap-4">
              {getCurrentMenuItems().map((item: MenuItem) => (
                <div
                  key={item.id}
                  className="flex items-start justify-between p-4 bg-gray-50 rounded-lg"
                >
                  <div>
                    <div className="flex items-center gap-2">
                      <h4 className="font-medium text-gray-900">{item.name}</h4>
                      <span className={`text-xs px-2 py-1 rounded ${
                        item.isVeg ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
                      }`}>
                        {item.isVeg ? 'Veg' : 'Non-veg'}
                      </span>
                    </div>
                    {item.description && (
                      <p className="mt-1 text-sm text-gray-600">{item.description}</p>
                    )}
                  </div>
                  {editMode && (
                    <button
                      onClick={() => removeMenuItem(item.id)}
                      className="text-red-600 hover:text-red-800"
                    >
                      Remove
                    </button>
                  )}
                </div>
              ))}
            </div>
          ) : (
            <p className="text-center text-gray-500 py-4">
              No items available for this meal
            </p>
          )}
        </div>
      </div>
    </div>
  );
};

export default DailyMenu;