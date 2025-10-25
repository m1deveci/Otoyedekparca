interface LogData {
  user_id?: string;
  action: string;
  entity_type: string;
  entity_id?: number;
  description: string;
  old_values?: any;
  new_values?: any;
}

export const logAction = async (logData: LogData) => {
  try {
    const response = await fetch('/api/admin/system-logs', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        ...logData,
        ip_address: '127.0.0.1', // Bu gerçek IP adresi olmalı
        user_agent: navigator.userAgent,
      }),
    });

    if (!response.ok) {
      console.error('Failed to log action:', logData);
    }
  } catch (error) {
    console.error('Error logging action:', error);
  }
};

export const logActions = {
  // Kategori işlemleri
  categoryCreated: (category: any) => logAction({
    action: 'created',
    entity_type: 'category',
    entity_id: category.id,
    description: `Kategori oluşturuldu: ${category.name}`,
    new_values: category,
  }),

  categoryUpdated: (oldCategory: any, newCategory: any) => logAction({
    action: 'updated',
    entity_type: 'category',
    entity_id: newCategory.id,
    description: `Kategori güncellendi: ${newCategory.name}`,
    old_values: oldCategory,
    new_values: newCategory,
  }),

  categoryDeleted: (category: any) => logAction({
    action: 'deleted',
    entity_type: 'category',
    entity_id: category.id,
    description: `Kategori silindi: ${category.name}`,
    old_values: category,
  }),

  // Ürün işlemleri
  productCreated: (product: any) => logAction({
    action: 'created',
    entity_type: 'product',
    entity_id: product.id,
    description: `Ürün oluşturuldu: ${product.name}`,
    new_values: product,
  }),

  productUpdated: (oldProduct: any, newProduct: any) => logAction({
    action: 'updated',
    entity_type: 'product',
    entity_id: newProduct.id,
    description: `Ürün güncellendi: ${newProduct.name}`,
    old_values: oldProduct,
    new_values: newProduct,
  }),

  productDeleted: (product: any) => logAction({
    action: 'deleted',
    entity_type: 'product',
    entity_id: product.id,
    description: `Ürün silindi: ${product.name}`,
    old_values: product,
  }),

  // Teknik servis işlemleri
  technicalServiceCreated: (service: any) => logAction({
    action: 'created',
    entity_type: 'technical_service',
    entity_id: service.id,
    description: `Teknik servis oluşturuldu: ${service.name}`,
    new_values: service,
  }),

  technicalServiceUpdated: (oldService: any, newService: any) => logAction({
    action: 'updated',
    entity_type: 'technical_service',
    entity_id: newService.id,
    description: `Teknik servis güncellendi: ${newService.name}`,
    old_values: oldService,
    new_values: newService,
  }),

  technicalServiceDeleted: (service: any) => logAction({
    action: 'deleted',
    entity_type: 'technical_service',
    entity_id: service.id,
    description: `Teknik servis silindi: ${service.name}`,
    old_values: service,
  }),

  // Kredi işlemleri
  creditPayment: (service: any, amount: number, description: string) => logAction({
    action: 'payment',
    entity_type: 'credit_transaction',
    entity_id: service.id,
    description: `Ödeme yapıldı: ${service.name} - ${amount} TL - ${description}`,
    new_values: { amount, description },
  }),

  creditSale: (service: any, amount: number, description: string) => logAction({
    action: 'credit_sale',
    entity_type: 'credit_transaction',
    entity_id: service.id,
    description: `Veresiye satış: ${service.name} - ${amount} TL - ${description}`,
    new_values: { amount, description },
  }),

  // Sipariş işlemleri
  orderCreated: (order: any) => logAction({
    action: 'created',
    entity_type: 'order',
    entity_id: order.id,
    description: `Sipariş oluşturuldu: #${order.id}`,
    new_values: order,
  }),

  orderUpdated: (oldOrder: any, newOrder: any) => logAction({
    action: 'updated',
    entity_type: 'order',
    entity_id: newOrder.id,
    description: `Sipariş güncellendi: #${newOrder.id}`,
    old_values: oldOrder,
    new_values: newOrder,
  }),

  orderDeleted: (order: any) => logAction({
    action: 'deleted',
    entity_type: 'order',
    entity_id: order.id,
    description: `Sipariş silindi: #${order.id}`,
    old_values: order,
  }),

  // Kullanıcı işlemleri
  userLogin: (user: any) => logAction({
    action: 'login',
    entity_type: 'user',
    entity_id: user.id,
    description: `Kullanıcı giriş yaptı: ${user.email || user.name}`,
    new_values: { login_time: new Date().toISOString() },
  }),

  userLogout: (user: any) => logAction({
    action: 'logout',
    entity_type: 'user',
    entity_id: user.id,
    description: `Kullanıcı çıkış yaptı: ${user.email || user.name}`,
    new_values: { logout_time: new Date().toISOString() },
  }),

  // Veresiye satış işlemleri
  creditSaleCreated: (service: any, totalAmount: number, productsSold: any[]) => logAction({
    action: 'credit_sale',
    entity_type: 'credit_sale',
    entity_id: service.id,
    description: `Veresiye satış yapıldı: ${service.name} - Toplam: ${totalAmount.toLocaleString('tr-TR')} ₺`,
    new_values: { totalAmount, productsSold, serviceName: service.name },
  }),

  // Borç ödeme işlemleri
  creditPaymentMade: (service: any, amount: number, paymentMethod: string, referenceNumber?: string) => logAction({
    action: 'payment',
    entity_type: 'credit_transaction',
    entity_id: service.id,
    description: `Borç ödemesi yapıldı: ${service.name} - ${amount.toLocaleString('tr-TR')} ₺ - ${paymentMethod}`,
    new_values: { amount, paymentMethod, referenceNumber, serviceName: service.name },
  }),

  // Sistem işlemleri
  systemAction: (action: string, description: string, data?: any) => logAction({
    action,
    entity_type: 'system',
    description,
    new_values: data,
  }),
};
