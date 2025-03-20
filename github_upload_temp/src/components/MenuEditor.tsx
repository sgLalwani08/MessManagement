import React, { useState, useEffect } from 'react';
import { DAYS_OF_WEEK, MEAL_TYPES } from '../constants/options';
import { useNavigate } from 'react-router-dom';
import { LogOut, Save, AlertCircle } from 'lucide-react';

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

const MenuEditor = () => {
  const navigate = useNavigate();
  const [weeklyMenu, setWeeklyMenu] = useState<WeeklyMenu>(() => {
    const savedMenu = localStorage.getItem('weeklyMenu');
    return savedMenu ? JSON.parse(savedMenu) : initializeEmptyMenu();
  });
  
  const [selectedDay, setSelectedDay] = useState(DAYS_OF_WEEK[0]);
  const [selectedMeal, setSelectedMeal] = useState(MEAL_TYPES[0].value);
  const [newItem, setNewItem] = useState({ name: '', description: '', isVeg: true });
  const [saveStatus, setSaveStatus] = useState<{message: string, type: 'success' | 'error'} | null>(null);

  // Initialize an empty menu structure for all days and meal types
  function initializeEmptyMenu(): WeeklyMenu {
    const emptyMenu: WeeklyMenu = {};
    
    DAYS_OF_WEEK.forEach(day => {
      emptyMenu[day] = {};
      MEAL_TYPES.forEach(meal => {
        emptyMenu[day][meal.value] = {
          items: []
        };
      });
    });
    
    return emptyMenu;
  }

  useEffect(() => {
    // Check if user is admin
    const isAdmin = localStorage.getItem('userRole') === 'admin';
    if (!isAdmin) {
      navigate('/login');
    }
  }, [navigate]);

  useEffect(() => {
    // Save the menu to localStorage whenever it changes
    localStorage.setItem('weeklyMenu', JSON.stringify(weeklyMenu));
    
    // Show save status briefly
    if (Object.keys(weeklyMenu).length > 0) {
      setSaveStatus({ message: 'Menu saved successfully', type: 'success' });
      const timer = setTimeout(() => setSaveStatus(null), 3000);
      return () => clearTimeout(timer);
    }
  }, [weeklyMenu]);

  const handleLogout = () => {
    localStorage.removeItem('isAuthenticated');
    localStorage.removeItem('userRole');
    localStorage.removeItem('currentUser');
    navigate('/');
  };

  const addMenuItem = () => {
    if (!newItem.name) return;

    // Create a deep copy of the current weekly menu
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

    // Update state
    setWeeklyMenu(updatedMenu);
    setNewItem({ name: '', description: '', isVeg: true });
    setSaveStatus({ message: 'Item added successfully', type: 'success' });
    
    // Clear status after 3 seconds
    setTimeout(() => setSaveStatus(null), 3000);
  };

  const removeMenuItem = (dayId: string, mealType: string, itemId: string) => {
    // Create a deep copy of the current weekly menu
    const updatedMenu = { ...weeklyMenu };
    
    // Make sure the path exists
    if (updatedMenu[dayId] && 
        updatedMenu[dayId][mealType] && 
        updatedMenu[dayId][mealType].items) {
      
      // Filter out the item to remove
      updatedMenu[dayId][mealType].items = updatedMenu[dayId][mealType].items.filter(
        (item: MenuItem) => item.id !== itemId
      );
      
      // Update state
      setWeeklyMenu(updatedMenu);
      setSaveStatus({ message: 'Item removed successfully', type: 'success' });
      
      // Clear status after 3 seconds
      setTimeout(() => setSaveStatus(null), 3000);
    }
  };

  const saveCompleteMenu = () => {
    try {
      localStorage.setItem('weeklyMenu', JSON.stringify(weeklyMenu));
      setSaveStatus({ message: 'All menus saved successfully', type: 'success' });
      setTimeout(() => setSaveStatus(null), 3000);
    } catch (error) {
      setSaveStatus({ message: 'Failed to save menu', type: 'error' });
      setTimeout(() => setSaveStatus(null), 3000);
    }
  };

  return (
    <div className="p-6 max-w-4xl mx-auto">
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-2xl font-bold">Weekly Menu Editor</h2>
        <div className="flex space-x-4">
          <button
            onClick={saveCompleteMenu}
            className="inline-flex items-center px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700"
          >
            <Save className="h-5 w-5 mr-2" />
            Save All Menus
          </button>
          <button
            onClick={handleLogout}
            className="inline-flex items-center px-4 py-2 bg-gray-600 text-white rounded-md hover:bg-gray-700"
          >
            <LogOut className="h-5 w-5 mr-2" />
            Logout
          </button>
        </div>
      </div>
      
      {/* Save Status Message */}
      {saveStatus && (
        <div className={`mb-4 p-3 rounded-md ${
          saveStatus.type === 'success' ? 'bg-green-50 text-green-800' : 'bg-red-50 text-red-800'
        }`}>
          <div className="flex items-center">
            {saveStatus.type === 'error' && <AlertCircle className="h-5 w-5 mr-2" />}
            {saveStatus.message}
          </div>
        </div>
      )}
      
      <div className="mb-6 grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">Select Day</label>
          <select
            className="w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
            value={selectedDay}
            onChange={(e) => setSelectedDay(e.target.value)}
          >
            {DAYS_OF_WEEK.map(day => (
              <option key={day} value={day}>{day}</option>
            ))}
          </select>
        </div>
        
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">Select Meal</label>
          <select
            className="w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
            value={selectedMeal}
            onChange={(e) => setSelectedMeal(e.target.value)}
          >
            {MEAL_TYPES.map(meal => (
              <option key={meal.value} value={meal.value}>{meal.label}</option>
            ))}
          </select>
        </div>
      </div>

      <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200 mb-6">
        <h3 className="text-lg font-semibold mb-4">Add New Item</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <input
              type="text"
              placeholder="Item name"
              className="w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
              value={newItem.name}
              onChange={(e) => setNewItem({ ...newItem, name: e.target.value })}
            />
          </div>
          <div>
            <input
              type="text"
              placeholder="Description (optional)"
              className="w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
              value={newItem.description}
              onChange={(e) => setNewItem({ ...newItem, description: e.target.value })}
            />
          </div>
        </div>
        <div className="mt-4 flex items-center justify-between">
          <label className="flex items-center">
            <input
              type="checkbox"
              className="rounded border-gray-300 text-blue-600 shadow-sm focus:border-blue-500 focus:ring-blue-500"
              checked={newItem.isVeg}
              onChange={(e) => setNewItem({ ...newItem, isVeg: e.target.checked })}
            />
            <span className="ml-2 text-sm text-gray-600">Vegetarian</span>
          </label>
          <button
            onClick={addMenuItem}
            className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
          >
            Add Item
          </button>
        </div>
      </div>

      <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
        <h3 className="text-lg font-semibold mb-4">
          Current Menu - {selectedDay} ({MEAL_TYPES.find(m => m.value === selectedMeal)?.label})
        </h3>
        <div className="space-y-4">
          {weeklyMenu[selectedDay]?.[selectedMeal]?.items?.map((item: MenuItem) => (
            <div
              key={item.id}
              className="flex items-center justify-between p-3 bg-gray-50 rounded-md"
            >
              <div>
                <h4 className="font-medium">
                  {item.name}
                  <span className={`ml-2 text-xs px-2 py-1 rounded ${
                    item.isVeg ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
                  }`}>
                    {item.isVeg ? 'Veg' : 'Non-veg'}
                  </span>
                </h4>
                {item.description && (
                  <p className="text-sm text-gray-600">{item.description}</p>
                )}
              </div>
              <button
                onClick={() => removeMenuItem(selectedDay, selectedMeal, item.id)}
                className="text-red-600 hover:text-red-800"
              >
                Remove
              </button>
            </div>
          ))}
          {(!weeklyMenu[selectedDay]?.[selectedMeal]?.items?.length) && (
            <p className="text-gray-500 text-center py-4">No items added yet</p>
          )}
        </div>
      </div>
    </div>
  );
};

export default MenuEditor;