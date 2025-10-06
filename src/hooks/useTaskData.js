import { useState, useEffect } from 'react';
import { tasksData } from '../data/tasksData';
import { DATA_CONFIG } from '../config/dataConfig';

export function useTaskData() {
  const [tasks, setTasks] = useState([]);
  const [unassignedTasks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const loadData = async () => {
      setLoading(true);
      setError(null);

      try {
        if (DATA_CONFIG.useBuiltInData) {
          // Используем встроенные данные
          setTasks(tasksData);
        } else {
          // Загружаем данные из файла
          const response = await fetch(DATA_CONFIG.jsonFilePath);
          
          if (!response.ok) {
            throw new Error(`Не удалось загрузить файл: ${response.status} ${response.statusText}`);
          }
          
          const jsonData = await response.json();
          
          // Валидация данных
          if (!Array.isArray(jsonData)) {
            throw new Error('JSON файл должен содержать массив задач');
          }
          
          // Базовая валидация структуры задач
          const isValidTask = (task) => {
            return (
              typeof task === 'object' &&
              task !== null &&
              typeof task.taskid === 'number' &&
              typeof task.title === 'string' &&
              typeof task.assignee_username === 'string'
            );
          };
          
          const validTasks = jsonData.filter(isValidTask);
          
          if (validTasks.length === 0) {
            throw new Error('Не найдено валидных задач в файле');
          }
          
          setTasks(validTasks);
        }
      } catch (err) {
        const errorMessage = err instanceof Error ? err.message : 'Неизвестная ошибка при загрузке данных';
        setError(errorMessage);
        console.error('Ошибка загрузки данных:', err);
        
        // В случае ошибки используем встроенные данные как fallback
        setTasks(tasksData);
      } finally {
        setLoading(false);
      }
    };

    loadData();
  }, []);

  return { tasks, unassignedTasks, loading, error };
}