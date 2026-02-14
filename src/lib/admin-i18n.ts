export type AdminLocale = 'en' | 'es'

const dict = {
  en: {
    // Login
    'login.title': 'Welcome Back',
    'login.subtitle': 'Sign in to your admin panel',
    'login.username': 'Username',
    'login.password': 'Password',
    'login.submit': 'Sign In',
    'login.loading': 'Signing in…',
    'login.error.required': 'Username and password are required.',
    'login.error.connection': 'Connection error. Please try again.',
    'login.welcome': 'Welcome back',
    'login.redirecting': 'Preparing your dashboard…',

    // Greetings
    'greeting.morning': 'Good morning',
    'greeting.afternoon': 'Good afternoon',
    'greeting.evening': 'Good evening',

    // Farewell
    'farewell.morning': 'Have a great morning',
    'farewell.afternoon': 'Have a great afternoon',
    'farewell.evening': 'Have a wonderful evening',
    'farewell.sub': 'See you soon!',

    // Sidebar
    'sidebar.title': 'PGS Admin',
    'sidebar.overview': 'Overview',
    'sidebar.contacts': 'Contacts',
    'sidebar.blog': 'Blog Posts',
    'sidebar.users': 'Users',
    'sidebar.signOut': 'Sign Out',

    // Overview
    'overview.welcome': 'Welcome back',
    'overview.subtitle': "Here's what's happening today",
    'overview.totalContacts': 'Total Contacts',
    'overview.newContacts': 'New Contacts',
    'overview.totalPosts': 'Total Posts',
    'overview.published': 'Published',
    'overview.totalUsers': 'Total Users',

    // Contacts
    'contacts.title': 'Contacts',
    'contacts.empty': 'No contacts yet',
    'contacts.emptyDesc': 'Contact submissions will appear here.',
    'contacts.name': 'Name',
    'contacts.email': 'Email',
    'contacts.service': 'Service',
    'contacts.status': 'Status',
    'contacts.date': 'Date',
    'contacts.actions': 'Actions',
    'contacts.deleteConfirm': 'Are you sure you want to delete this contact?',
    'contacts.viewDetails': 'View Details',
    'contacts.details': 'Contact Details',
    'contacts.phone': 'Phone',
    'contacts.company': 'Company',
    'contacts.requestedDate': 'Requested Date',
    'contacts.contactTime': 'Contact Preference',
    'contacts.address': 'Address',
    'contacts.message': 'Message',
    'contacts.close': 'Close',
    'contacts.statusNew': 'New',
    'contacts.statusContacted': 'Contacted',
    'contacts.statusInProgress': 'In Progress',
    'contacts.statusCompleted': 'Completed',
    'contacts.statusArchived': 'Archived',
    'contacts.notProvided': 'Not provided',

    // Blog
    'blog.title': 'Blog Posts',
    'blog.posts': 'posts',
    'blog.newPost': 'New Post',
    'blog.empty': 'No blog posts yet',
    'blog.emptyDesc': 'Create your first post to get started.',
    'blog.titleCol': 'Title',
    'blog.category': 'Category',
    'blog.status': 'Status',
    'blog.date': 'Date',
    'blog.actions': 'Actions',
    'blog.deleteConfirm': 'Are you sure you want to delete this post?',
    'blog.publish': 'Publish',
    'blog.unpublish': 'Unpublish',

    // Blog Editor
    'editor.back': 'Back to posts',
    'editor.save': 'Save',
    'editor.saving': 'Saving…',
    'editor.draft': 'Draft',
    'editor.published': 'Published',
    'editor.settings': 'Post Settings',
    'editor.slug': 'Slug',
    'editor.auto': 'Auto',
    'editor.category': 'Category',
    'editor.tags': 'Tags (comma separated)',
    'editor.coverImage': 'Cover Image URL',
    'editor.titleField': 'Title',
    'editor.excerpt': 'Excerpt',
    'editor.content': 'Content (Markdown)',
    'editor.selectCategory': 'Select category',
    'editor.error.connection': 'Connection error',

    // Users
    'users.title': 'Users',
    'users.usersCount': 'users',
    'users.addUser': 'Add User',
    'users.fullName': 'Full Name',
    'users.username': 'Username',
    'users.password': 'Password',
    'users.role': 'Role',
    'users.roleAdmin': 'Admin',
    'users.roleStaff': 'Staff',
    'users.cancel': 'Cancel',
    'users.create': 'Create User',
    'users.creating': 'Creating…',
    'users.empty': 'No users yet',
    'users.emptyDesc': 'Create the first user to get started.',
    'users.nameCol': 'Name',
    'users.usernameCol': 'Username',
    'users.roleCol': 'Role',
    'users.dateCol': 'Created',
    'users.actionsCol': 'Actions',
    'users.deleteConfirm': 'Are you sure you want to delete this user?',
    'users.errorRequired': 'All fields are required.',
  },
  es: {
    // Login
    'login.title': 'Bienvenido de nuevo',
    'login.subtitle': 'Inicia sesión en tu panel de administración',
    'login.username': 'Usuario',
    'login.password': 'Contraseña',
    'login.submit': 'Iniciar Sesión',
    'login.loading': 'Iniciando sesión…',
    'login.error.required': 'El usuario y la contraseña son requeridos.',
    'login.error.connection': 'Error de conexión. Intente nuevamente.',
    'login.welcome': 'Bienvenido de nuevo',
    'login.redirecting': 'Preparando tu panel…',

    // Greetings
    'greeting.morning': 'Buenos días',
    'greeting.afternoon': 'Buenas tardes',
    'greeting.evening': 'Buenas noches',

    // Farewell
    'farewell.morning': 'Que tengas una gran mañana',
    'farewell.afternoon': 'Que tengas una gran tarde',
    'farewell.evening': 'Que tengas una hermosa noche',
    'farewell.sub': '¡Hasta pronto!',

    // Sidebar
    'sidebar.title': 'PGS Admin',
    'sidebar.overview': 'Resumen',
    'sidebar.contacts': 'Contactos',
    'sidebar.blog': 'Blog',
    'sidebar.users': 'Usuarios',
    'sidebar.signOut': 'Cerrar Sesión',

    // Overview
    'overview.welcome': 'Bienvenido de nuevo',
    'overview.subtitle': 'Esto es lo que está pasando hoy',
    'overview.totalContacts': 'Contactos Totales',
    'overview.newContacts': 'Nuevos Contactos',
    'overview.totalPosts': 'Posts Totales',
    'overview.published': 'Publicados',
    'overview.totalUsers': 'Usuarios Totales',

    // Contacts
    'contacts.title': 'Contactos',
    'contacts.empty': 'No hay contactos aún',
    'contacts.emptyDesc': 'Las solicitudes de contacto aparecerán aquí.',
    'contacts.name': 'Nombre',
    'contacts.email': 'Correo',
    'contacts.service': 'Servicio',
    'contacts.status': 'Estado',
    'contacts.date': 'Fecha',
    'contacts.actions': 'Acciones',
    'contacts.deleteConfirm': '¿Está seguro de que desea eliminar este contacto?',
    'contacts.viewDetails': 'Ver Detalles',
    'contacts.details': 'Detalles del Contacto',
    'contacts.phone': 'Teléfono',
    'contacts.company': 'Empresa',
    'contacts.requestedDate': 'Fecha Solicitada',
    'contacts.contactTime': 'Preferencia de Contacto',
    'contacts.address': 'Dirección',
    'contacts.message': 'Mensaje',
    'contacts.close': 'Cerrar',
    'contacts.statusNew': 'Nuevo',
    'contacts.statusContacted': 'Contactado',
    'contacts.statusInProgress': 'En Proceso',
    'contacts.statusCompleted': 'Completado',
    'contacts.statusArchived': 'Archivado',
    'contacts.notProvided': 'No proporcionado',

    // Blog
    'blog.title': 'Blog',
    'blog.posts': 'publicaciones',
    'blog.newPost': 'Nuevo Post',
    'blog.empty': 'No hay publicaciones aún',
    'blog.emptyDesc': 'Crea tu primera publicación para comenzar.',
    'blog.titleCol': 'Título',
    'blog.category': 'Categoría',
    'blog.status': 'Estado',
    'blog.date': 'Fecha',
    'blog.actions': 'Acciones',
    'blog.deleteConfirm': '¿Está seguro de que desea eliminar esta publicación?',
    'blog.publish': 'Publicar',
    'blog.unpublish': 'Despublicar',

    // Blog Editor
    'editor.back': 'Volver a publicaciones',
    'editor.save': 'Guardar',
    'editor.saving': 'Guardando…',
    'editor.draft': 'Borrador',
    'editor.published': 'Publicado',
    'editor.settings': 'Configuración del Post',
    'editor.slug': 'Slug',
    'editor.auto': 'Auto',
    'editor.category': 'Categoría',
    'editor.tags': 'Etiquetas (separadas por coma)',
    'editor.coverImage': 'URL de imagen de portada',
    'editor.titleField': 'Título',
    'editor.excerpt': 'Extracto',
    'editor.content': 'Contenido (Markdown)',
    'editor.selectCategory': 'Seleccionar categoría',
    'editor.error.connection': 'Error de conexión',

    // Users
    'users.title': 'Usuarios',
    'users.usersCount': 'usuarios',
    'users.addUser': 'Agregar Usuario',
    'users.fullName': 'Nombre Completo',
    'users.username': 'Usuario',
    'users.password': 'Contraseña',
    'users.role': 'Rol',
    'users.roleAdmin': 'Administrador',
    'users.roleStaff': 'Personal',
    'users.cancel': 'Cancelar',
    'users.create': 'Crear Usuario',
    'users.creating': 'Creando…',
    'users.empty': 'No hay usuarios aún',
    'users.emptyDesc': 'Crea el primer usuario para comenzar.',
    'users.nameCol': 'Nombre',
    'users.usernameCol': 'Usuario',
    'users.roleCol': 'Rol',
    'users.dateCol': 'Creado',
    'users.actionsCol': 'Acciones',
    'users.deleteConfirm': '¿Está seguro de que desea eliminar este usuario?',
    'users.errorRequired': 'Todos los campos son obligatorios.',
  },
} as const

export type AdminKey = keyof (typeof dict)['en']

export function getAdminT(locale: AdminLocale) {
  return (key: AdminKey): string => {
    return dict[locale]?.[key] ?? dict.en[key] ?? key
  }
}

export function getTimeGreeting(locale: AdminLocale): string {
  const h = new Date().getHours()
  if (h < 12) return dict[locale]['greeting.morning']
  if (h < 18) return dict[locale]['greeting.afternoon']
  return dict[locale]['greeting.evening']
}

export function getTimeFarewell(locale: AdminLocale): string {
  const h = new Date().getHours()
  if (h < 12) return dict[locale]['farewell.morning']
  if (h < 18) return dict[locale]['farewell.afternoon']
  return dict[locale]['farewell.evening']
}

const STORAGE_KEY = 'pgs-admin-lang'

export function getStoredAdminLocale(): AdminLocale {
  if (typeof window === 'undefined') return 'en'
  return (localStorage.getItem(STORAGE_KEY) as AdminLocale) || 'en'
}

export function setStoredAdminLocale(locale: AdminLocale) {
  localStorage.setItem(STORAGE_KEY, locale)
}
