import { PrismaClient } from '@prisma/client'
import bcrypt from 'bcryptjs'

const prisma = new PrismaClient()

async function main() {
  // Create default admin user
  const passwordHash = await bcrypt.hash('admin123', 12)

  await prisma.user.upsert({
    where: { username: 'admin' },
    update: {},
    create: {
      username: 'admin',
      passwordHash,
      fullName: 'Admin User',
      role: 'ADMIN',
    },
  })

  console.log('Seed: admin user created (username: admin, password: admin123)')

  // Create sample blog post
  await prisma.blogPost.upsert({
    where: { slug: 'why-commercial-cleaning-matters' },
    update: {},
    create: {
      slug: 'why-commercial-cleaning-matters',
      category: 'Cleaning Tips',
      tags: 'cleaning, commercial, tips',
      status: 'PUBLISHED',
      publishedAt: new Date(),
      titleEn: 'Why Commercial Cleaning Matters for Your Business',
      titleFr: 'Pourquoi le nettoyage commercial est important pour votre entreprise',
      titleEs: 'Por qué la limpieza comercial es importante para tu negocio',
      excerptEn: 'Discover why maintaining a clean commercial space is essential for employee productivity, client trust, and long-term business success.',
      excerptFr: 'Découvrez pourquoi maintenir un espace commercial propre est essentiel pour la productivité des employés, la confiance des clients et le succès à long terme.',
      excerptEs: 'Descubre por qué mantener un espacio comercial limpio es esencial para la productividad de los empleados, la confianza de los clientes y el éxito a largo plazo.',
      contentEn: `## The Impact of a Clean Workspace

A clean commercial environment does more than look good — it directly affects your bottom line.

### Employee Productivity

Studies show that employees working in clean environments are up to **15% more productive**. Cluttered, dirty spaces lead to distraction and discomfort.

### Client Impressions

Your workspace is often the first thing clients and visitors notice. A spotless office communicates professionalism, attention to detail, and respect for your business relationships.

### Health & Safety

Regular cleaning and disinfection reduce the spread of illness-causing germs, leading to fewer sick days and a healthier team overall.

### Long-Term Savings

Proper maintenance of floors, carpets, and surfaces extends their lifespan, saving you money on replacements and repairs.

---

*Need help keeping your commercial space clean? [Contact us](/en/contact) for a free quote.*`,
      contentFr: `## L'impact d'un espace de travail propre

Un environnement commercial propre fait plus que bien paraître — il affecte directement vos résultats.

### Productivité des employés

Des études montrent que les employés travaillant dans des environnements propres sont jusqu'à **15 % plus productifs**. Les espaces encombrés et sales mènent à la distraction et à l'inconfort.

### Impressions des clients

Votre espace de travail est souvent la première chose que les clients et visiteurs remarquent. Un bureau impeccable communique le professionnalisme, le souci du détail et le respect de vos relations d'affaires.

### Santé et sécurité

Le nettoyage et la désinfection réguliers réduisent la propagation des germes causant des maladies, ce qui entraîne moins de jours de maladie et une équipe globalement plus saine.

### Économies à long terme

L'entretien approprié des planchers, tapis et surfaces prolonge leur durée de vie, vous faisant économiser sur les remplacements et les réparations.

---

*Besoin d'aide pour garder votre espace commercial propre ? [Contactez-nous](/fr/contact) pour une soumission gratuite.*`,
      contentEs: `## El impacto de un espacio de trabajo limpio

Un ambiente comercial limpio hace más que verse bien — afecta directamente tus resultados.

### Productividad de los empleados

Los estudios muestran que los empleados que trabajan en ambientes limpios son hasta un **15% más productivos**. Los espacios desordenados y sucios llevan a la distracción y la incomodidad.

### Impresiones de los clientes

Tu espacio de trabajo es a menudo lo primero que los clientes y visitantes notan. Una oficina impecable comunica profesionalismo, atención al detalle y respeto por tus relaciones comerciales.

### Salud y seguridad

La limpieza y desinfección regular reducen la propagación de gérmenes causantes de enfermedades, lo que resulta en menos días de enfermedad y un equipo más saludable en general.

### Ahorro a largo plazo

El mantenimiento adecuado de pisos, alfombras y superficies extiende su vida útil, ahorrándote dinero en reemplazos y reparaciones.

---

*¿Necesitas ayuda para mantener tu espacio comercial limpio? [Contáctanos](/es/contact) para una cotización gratis.*`,
    },
  })

  console.log('Seed: sample blog post created')
}

main()
  .catch((e) => {
    console.error(e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })
