import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import Icon from '@/components/ui/icon';
import Cart from '@/components/Cart';
import { useToast } from '@/hooks/use-toast';

interface Product {
  id: number;
  name: string;
  description: string;
  price: number;
  image: string;
  category: string;
}

interface CartItem {
  id: number;
  name: string;
  price: number;
  image: string;
  quantity: number;
}

const products: Product[] = [
  {
    id: 1,
    name: 'Матрёшка классическая',
    description: 'Традиционная русская матрёшка ручной работы с цветочной росписью. Набор из 5 кукол.',
    price: 2500,
    image: 'https://cdn.poehali.dev/projects/fe443828-51a0-40cf-a824-6ef601930c39/files/56f3f7a8-c759-4cb0-950d-0756faa37cac.jpg',
    category: 'Традиционные'
  },
  {
    id: 2,
    name: 'Кружка керамическая',
    description: 'Керамическая кружка с авторским дизайном и яркими узорами. Объём 350 мл.',
    price: 850,
    image: 'https://cdn.poehali.dev/projects/fe443828-51a0-40cf-a824-6ef601930c39/files/f81566d0-a06e-415e-89d7-c31a6b91d740.jpg',
    category: 'Посуда'
  },
  {
    id: 3,
    name: 'Брелок сувенирный',
    description: 'Металлический брелок с изображением достопримечательности города.',
    price: 450,
    image: 'https://cdn.poehali.dev/projects/fe443828-51a0-40cf-a824-6ef601930c39/files/7ea9e1df-3b14-4f89-9510-226600ed3522.jpg',
    category: 'Аксессуары'
  },
  {
    id: 4,
    name: 'Шкатулка деревянная',
    description: 'Изящная шкатулка из дерева с резным орнаментом для хранения украшений.',
    price: 1800,
    image: 'https://cdn.poehali.dev/projects/fe443828-51a0-40cf-a824-6ef601930c39/files/56f3f7a8-c759-4cb0-950d-0756faa37cac.jpg',
    category: 'Традиционные'
  },
  {
    id: 5,
    name: 'Магнит на холодильник',
    description: 'Яркий магнит с памятными местами. Коллекционная серия.',
    price: 250,
    image: 'https://cdn.poehali.dev/projects/fe443828-51a0-40cf-a824-6ef601930c39/files/7ea9e1df-3b14-4f89-9510-226600ed3522.jpg',
    category: 'Аксессуары'
  },
  {
    id: 6,
    name: 'Набор тарелок',
    description: 'Комплект из 6 декоративных тарелок с росписью. Диаметр 20 см.',
    price: 3200,
    image: 'https://cdn.poehali.dev/projects/fe443828-51a0-40cf-a824-6ef601930c39/files/f81566d0-a06e-415e-89d7-c31a6b91d740.jpg',
    category: 'Посуда'
  }
];

const categories = ['Все', 'Традиционные', 'Посуда', 'Аксессуары'];

export default function Index() {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('Все');
  const [cartItems, setCartItems] = useState<CartItem[]>([]);
  const { toast } = useToast();

  const filteredProducts = products.filter(product => {
    const matchesSearch = product.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         product.description.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesCategory = selectedCategory === 'Все' || product.category === selectedCategory;
    return matchesSearch && matchesCategory;
  });

  const handleAddToCart = (product: Product) => {
    const existingItem = cartItems.find(item => item.id === product.id);
    
    if (existingItem) {
      setCartItems(cartItems.map(item =>
        item.id === product.id
          ? { ...item, quantity: item.quantity + 1 }
          : item
      ));
    } else {
      setCartItems([...cartItems, {
        id: product.id,
        name: product.name,
        price: product.price,
        image: product.image,
        quantity: 1
      }]);
    }

    toast({
      title: 'Товар добавлен',
      description: `${product.name} добавлен в корзину`,
    });
  };

  const handleUpdateQuantity = (id: number, quantity: number) => {
    setCartItems(cartItems.map(item =>
      item.id === id ? { ...item, quantity } : item
    ));
  };

  const handleRemoveItem = (id: number) => {
    setCartItems(cartItems.filter(item => item.id !== id));
    toast({
      title: 'Товар удалён',
      description: 'Товар удалён из корзины',
    });
  };

  const handleClearCart = () => {
    setCartItems([]);
  };

  return (
    <div className="min-h-screen bg-background">
      <header className="border-b border-border bg-white sticky top-0 z-50">
        <div className="container mx-auto px-4 py-6">
          <div className="flex items-center justify-between mb-6">
            <h1 className="text-3xl font-bold text-foreground">Каталог сувениров</h1>
            <Cart
              items={cartItems}
              onUpdateQuantity={handleUpdateQuantity}
              onRemoveItem={handleRemoveItem}
              onClearCart={handleClearCart}
            />
          </div>
          
          <div className="flex flex-col md:flex-row gap-4 items-start md:items-center">
            <div className="relative flex-1 w-full">
              <Icon name="Search" size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
              <Input
                type="text"
                placeholder="Поиск по каталогу..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10"
              />
            </div>
            
            <div className="flex gap-2 flex-wrap">
              {categories.map((category) => (
                <Button
                  key={category}
                  variant={selectedCategory === category ? 'default' : 'outline'}
                  size="sm"
                  onClick={() => setSelectedCategory(category)}
                >
                  {category}
                </Button>
              ))}
            </div>
          </div>
        </div>
      </header>

      <main className="container mx-auto px-4 py-8">
        <div className="mb-6">
          <p className="text-muted-foreground">
            Найдено товаров: <span className="font-semibold text-foreground">{filteredProducts.length}</span>
          </p>
        </div>

        <div className="space-y-4">
          {filteredProducts.map((product, index) => (
            <div
              key={product.id}
              className="bg-white border border-border rounded-lg overflow-hidden hover:shadow-lg transition-shadow duration-300 animate-fade-in"
              style={{ animationDelay: `${index * 50}ms` }}
            >
              <div className="grid grid-cols-1 md:grid-cols-[200px_1fr_150px] gap-0">
                <div className="w-full h-48 md:h-auto bg-muted overflow-hidden">
                  <img
                    src={product.image}
                    alt={product.name}
                    className="w-full h-full object-cover hover:scale-105 transition-transform duration-300"
                  />
                </div>

                <div className="p-6 flex flex-col justify-center">
                  <div className="flex items-start justify-between mb-2">
                    <h3 className="text-xl font-semibold text-foreground">{product.name}</h3>
                    <Badge variant="secondary" className="ml-2 whitespace-nowrap">
                      {product.category}
                    </Badge>
                  </div>
                  <p className="text-muted-foreground leading-relaxed">
                    {product.description}
                  </p>
                </div>

                <div className="p-6 flex flex-col justify-center items-center md:items-end border-t md:border-t-0 md:border-l border-border">
                  <div className="text-center md:text-right mb-4">
                    <p className="text-sm text-muted-foreground mb-1">Цена</p>
                    <p className="text-3xl font-bold text-foreground">{product.price.toLocaleString('ru-RU')} ₽</p>
                  </div>
                  <Button
                    className="w-full md:w-auto"
                    onClick={() => handleAddToCart(product)}
                  >
                    <Icon name="ShoppingCart" size={18} className="mr-2" />
                    В корзину
                  </Button>
                </div>
              </div>
            </div>
          ))}
        </div>

        {filteredProducts.length === 0 && (
          <div className="text-center py-16">
            <Icon name="Package" size={48} className="mx-auto text-muted-foreground mb-4" />
            <h3 className="text-xl font-semibold text-foreground mb-2">Товары не найдены</h3>
            <p className="text-muted-foreground">Попробуйте изменить параметры поиска</p>
          </div>
        )}
      </main>

      <footer className="border-t border-border mt-16">
        <div className="container mx-auto px-4 py-8">
          <div className="flex flex-col md:flex-row justify-between items-center gap-4">
            <p className="text-muted-foreground text-sm">
              © 2024 Каталог сувениров. Все права защищены.
            </p>
            <div className="flex gap-6">
              <a href="#" className="text-muted-foreground hover:text-primary transition-colors">
                <Icon name="Phone" size={20} />
              </a>
              <a href="#" className="text-muted-foreground hover:text-primary transition-colors">
                <Icon name="Mail" size={20} />
              </a>
              <a href="#" className="text-muted-foreground hover:text-primary transition-colors">
                <Icon name="MapPin" size={20} />
              </a>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}