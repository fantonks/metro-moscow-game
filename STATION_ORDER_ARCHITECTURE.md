# Архитектура порядка станций метро

## Исходный файл - единственный источник истины

**Файл:** `lib/metro-data.ts`

**Массив:** `export const stations: Station[] = [...]`

Этот массив является **ЕДИНСТВЕННЫМ ИСТОЧНИКОМ ИСТИНЫ** для порядка станций метро.

## Как работает связь станций с popup

### 1. Отображение станций на карте

**Файл:** `components/metro-map.tsx`

```typescript
// Порядок берется СТРОГО из массива stations (без сортировки)
{stations.map(station => {
  // ...
  onClick={(e) => handleStationClick(station, e)} // Передаем объект Station целиком
})}
```

**Важно:**
- Используется `stations.map()` - порядок сохраняется из исходного массива
- НЕТ сортировки или изменения порядка
- Каждая станция идентифицируется по `station.id` (используется как `key={station.id}`)

### 2. Обработка клика на станцию

**Файл:** `components/metro-map.tsx`

```typescript
const handleStationClick = (station: Station, e: React.MouseEvent) => {
  e.stopPropagation()
  if (isStationAvailable(station.id)) {
    onStationClick(station) // Передаем объект Station целиком (содержит id)
  }
}
```

**Важно:**
- Передается объект `Station` целиком, а не индекс массива
- Объект содержит `station.id` для идентификации

### 3. Сохранение выбранной станции

**Файл:** `app/page.tsx`

```typescript
const [selectedStation, setSelectedStation] = useState<Station | null>(null)

const handleStationClick = useCallback((station: Station) => {
  setSelectedStation(station) // Сохраняем объект Station (содержит id)
  setShowPopup(true)
}, [])
```

**Важно:**
- Сохраняется объект `Station` целиком, а не индекс
- `selectedStation` содержит `id` для идентификации

### 4. Отображение popup

**Файл:** `app/page.tsx`

```typescript
{selectedStation && (
  <StationPopup
    station={selectedStation} // Объект Station содержит id для идентификации
    gameState={gameState}
    isOpen={showPopup}
    onClose={handleClosePopup}
    onStartQuiz={handleStartQuiz}
  />
)}
```

**Важно:**
- Popup получает объект `Station` целиком
- Связь идет по `selectedStation.id`, а не по индексу массива
- Гарантирует правильное соответствие станции и popup

### 5. Отображение quiz

**Файл:** `app/page.tsx`

```typescript
{selectedStation && (
  <StationQuiz
    station={selectedStation} // Тот же объект Station, что и в Popup
    isOpen={showQuiz}
    onClose={handleCloseQuiz}
    onComplete={handleQuizComplete}
  />
)}
```

**Важно:**
- Quiz получает тот же объект `Station`, что и Popup
- Связь идет по `selectedStation.id`

## Ключевые принципы

1. **Порядок станций** определяется массивом `stations` в `lib/metro-data.ts`
2. **Связь станций с popup** идет по `station.id`, а не по индексу массива
3. **Нет сортировки** - порядок сохраняется из исходного массива
4. **Нет хардкода** - все данные берутся из массива `stations`
5. **Объект Station** передается целиком, содержащий все данные включая `id`

## Гарантии

✅ При клике на станцию открывается popup именно этой станции (по `station.id`)  
✅ Порядок popup соответствует порядку станций в массиве `stations`  
✅ Порядок не ломается при добавлении новых станций (если они добавлены в правильном месте массива)  
✅ Нет рассинхрона между станциями и popup (связь по `id`, а не по индексу)  
✅ Код читаемый и без дублирования логики

## Где происходит связывание popup ↔ станция

**Связывание происходит в следующих местах:**

1. **`components/metro-map.tsx`** (строка 233):
   ```typescript
   onClick={(e) => handleStationClick(station, e)}
   ```
   - При клике передается объект `station` (содержит `id`)

2. **`app/page.tsx`** (строка 61-63):
   ```typescript
   const handleStationClick = useCallback((station: Station) => {
     setSelectedStation(station) // Сохраняем объект Station
     setShowPopup(true)
   }, [])
   ```
   - Сохраняется объект `Station` в состоянии

3. **`app/page.tsx`** (строка 197-203):
   ```typescript
   <StationPopup
     station={selectedStation} // Передаем объект Station
     ...
   />
   ```
   - Popup получает объект `Station` целиком

**Связь идет по `station.id` на всех этапах, что гарантирует правильное соответствие.**
