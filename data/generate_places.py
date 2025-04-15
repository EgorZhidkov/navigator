import json
import random
from typing import List, Dict, Any


def load_place_types() -> List[Dict[str, Any]]:
    with open('data/place_types.json', 'r', encoding='utf-8') as f:
        return json.load(f)


def generate_coordinates() -> List[float]:
    # Координаты России примерно от 41° до 82° с.ш. и от 19° до 169° в.д.
    lat = random.uniform(41, 82)
    lon = random.uniform(19, 169)
    return [lon, lat]


def generate_opening_hours() -> str:
    # Генерация случайного времени работы
    start_hour = random.randint(7, 10)
    end_hour = random.randint(17, 22)
    return f"{start_hour:02d}:00-{end_hour:02d}:00"


def generate_place_name(place_type: Dict[str, Any]) -> str:
    # Базовые названия для разных типов объектов
    name_prefixes = {
        "Космодром": ["Восточный", "Плесецк", "Капустин Яр", "Свободный"],
        "Музей": ["Музей космонавтики", "Музей ракетно-космической техники", "Музей истории космонавтики"],
        "Исследовательский центр": ["НИИ", "Исследовательский центр", "Научный центр"],
        "Завод": ["Машиностроительный завод", "Ракетно-космический завод", "Приборостроительный завод"],
        "Исторический объект": ["Памятный комплекс", "Историческая площадка", "Мемориал"],
        "Учебное заведение": ["Университет", "Институт", "Академия"],
        "Памятник": ["Памятник", "Монумент", "Стела"],
        "Центр управления полетами": ["ЦУП", "Центр управления", "Командный пункт"],
        "Испытательный полигон": ["Полигон", "Испытательная база", "Тестовый комплекс"],
        "Образовательный центр": ["Образовательный центр", "Учебный центр", "Центр подготовки"]
    }

    # Города России
    cities = ["Москва", "Санкт-Петербург", "Королёв", "Байконур", "Самара", "Воронеж",
              "Омск", "Красноярск", "Железногорск", "Химки", "Реутов", "Пермь"]

    prefix = random.choice(name_prefixes.get(place_type["name"], ["Объект"]))
    city = random.choice(cities)

    if place_type["name"] == "Памятник":
        famous_people = ["Ю.А. Гагарина", "С.П. Королёва", "В.П. Глушко", "М.К. Янгеля",
                         "В.Н. Челомея", "К.Э. Циолковского"]
        return f"{prefix} {random.choice(famous_people)} ({city})"

    return f"{prefix} ({city})"


def generate_description(place_type: Dict[str, Any]) -> str:
    descriptions = {
        "Космодром": [
            "Действующий космодром для запуска космических аппаратов",
            "Стартовый комплекс для ракет-носителей различных классов",
            "Современный космический порт с развитой инфраструктурой"
        ],
        "Музей": [
            "Экспозиция, посвященная истории космонавтики",
            "Коллекция космической техники и оборудования",
            "Интерактивный музей с образовательными программами"
        ],
        "Исследовательский центр": [
            "Центр разработки космических технологий",
            "Научно-исследовательский институт космической отрасли",
            "Лаборатория космических исследований"
        ],
        "Завод": [
            "Производство компонентов для космических аппаратов",
            "Сборка ракетных двигателей и систем управления",
            "Изготовление космической техники и оборудования"
        ]
    }

    default_descriptions = [
        "Объект космической инфраструктуры",
        "Важный элемент ракетно-космической отрасли",
        "Стратегический объект космической промышленности"
    ]

    type_descriptions = descriptions.get(
        place_type["name"], default_descriptions)
    return random.choice(type_descriptions)


def generate_places(count: int) -> List[Dict[str, Any]]:
    place_types = load_place_types()
    places = []

    for i in range(count):
        place_type = random.choice(place_types)
        place = {
            "id": i + 1,
            "name": generate_place_name(place_type),
            "coordinates": generate_coordinates(),
            "description": generate_description(place_type),
            "opening_hours": generate_opening_hours(),
            "type_id": place_type["id"]
        }
        places.append(place)

    return places


def main():
    # Генерация 2000 мест
    places = generate_places(2000)

    # Сохранение в файл
    with open('data/places.json', 'w', encoding='utf-8') as f:
        json.dump(places, f, ensure_ascii=False, indent=2)


if __name__ == "__main__":
    main()
