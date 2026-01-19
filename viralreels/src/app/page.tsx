import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";

export default function HomePage() {
  return (
    <div className="min-h-screen bg-gradient-to-b from-purple-50 to-white">
      {/* Navigation */}
      <nav className="border-b bg-white/80 backdrop-blur-sm sticky top-0 z-50">
        <div className="container mx-auto px-4 h-16 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 bg-gradient-to-br from-purple-600 to-pink-600 rounded-lg" />
            <span className="text-xl font-bold">ViralReels</span>
          </div>
          <div className="flex items-center gap-4">
            <Link href="/pricing">
              <Button variant="ghost">Tarifs</Button>
            </Link>
            <Link href="/login">
              <Button variant="ghost">Connexion</Button>
            </Link>
            <Link href="/login">
              <Button>Commencer gratuitement</Button>
            </Link>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="container mx-auto px-4 py-20 text-center">
        <div className="max-w-4xl mx-auto">
          <h1 className="text-5xl md:text-6xl font-bold mb-6 bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent">
            Transformez vos vidéos YouTube en clips viraux
          </h1>
          <p className="text-xl text-gray-600 mb-8">
            Utilisez l'IA pour identifier automatiquement les meilleurs moments de vos vidéos et créer des clips optimisés pour TikTok, Instagram Reels et YouTube Shorts.
          </p>
          <div className="flex gap-4 justify-center">
            <Link href="/login">
              <Button size="lg" className="text-lg px-8">
                Commencer gratuitement
              </Button>
            </Link>
            <Link href="#features">
              <Button size="lg" variant="outline" className="text-lg px-8">
                En savoir plus
              </Button>
            </Link>
          </div>
          <p className="text-sm text-gray-500 mt-4">
            1 vidéo gratuite par mois. Sans carte bancaire.
          </p>
        </div>
      </section>

      {/* Features */}
      <section id="features" className="container mx-auto px-4 py-20">
        <div className="text-center mb-12">
          <h2 className="text-3xl font-bold mb-4">Fonctionnalités puissantes</h2>
          <p className="text-gray-600">Tout ce dont vous avez besoin pour créer des clips viraux</p>
        </div>

        <div className="grid md:grid-cols-3 gap-8 max-w-5xl mx-auto">
          <Card>
            <CardHeader>
              <CardTitle>Analyse IA</CardTitle>
              <CardDescription>
                Identifie automatiquement les moments à fort potentiel viral
              </CardDescription>
            </CardHeader>
            <CardContent>
              <ul className="space-y-2 text-sm text-gray-600">
                <li>• Détection des hooks accrocheurs</li>
                <li>• Analyse émotionnelle</li>
                <li>• Score de viralité (0-100)</li>
                <li>• Suggestions optimisées</li>
              </ul>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Découpage intelligent</CardTitle>
              <CardDescription>
                Créez des clips parfaits de 10-60 secondes
              </CardDescription>
            </CardHeader>
            <CardContent>
              <ul className="space-y-2 text-sm text-gray-600">
                <li>• Transitions fluides</li>
                <li>• Format vertical automatique</li>
                <li>• Recadrage intelligent</li>
                <li>• Qualité jusqu'à 8K</li>
              </ul>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Sous-titres multilingues</CardTitle>
              <CardDescription>
                Transcription et traduction automatiques
              </CardDescription>
            </CardHeader>
            <CardContent>
              <ul className="space-y-2 text-sm text-gray-600">
                <li>• Transcription précise</li>
                <li>• Traduction FR/EN/ES/DE</li>
                <li>• Styles personnalisables</li>
                <li>• Synchronisation parfaite</li>
              </ul>
            </CardContent>
          </Card>
        </div>
      </section>

      {/* Pricing Preview */}
      <section className="container mx-auto px-4 py-20 bg-gray-50">
        <div className="text-center mb-12">
          <h2 className="text-3xl font-bold mb-4">Tarifs simples et transparents</h2>
          <p className="text-gray-600">Commencez gratuitement, évoluez selon vos besoins</p>
        </div>

        <div className="grid md:grid-cols-3 gap-8 max-w-5xl mx-auto">
          <Card>
            <CardHeader>
              <CardTitle>Gratuit</CardTitle>
              <div className="text-3xl font-bold mt-2">0€</div>
              <CardDescription>Pour essayer</CardDescription>
            </CardHeader>
            <CardContent>
              <ul className="space-y-2 text-sm">
                <li>✓ 1 vidéo par mois</li>
                <li>✓ Export HD</li>
                <li>✓ 5 clips par vidéo</li>
                <li>✓ Sous-titres basiques</li>
              </ul>
              <Link href="/login" className="block mt-6">
                <Button className="w-full" variant="outline">
                  Commencer
                </Button>
              </Link>
            </CardContent>
          </Card>

          <Card className="border-purple-600 border-2 relative">
            <div className="absolute -top-4 left-1/2 -translate-x-1/2 bg-purple-600 text-white px-4 py-1 rounded-full text-sm">
              Populaire
            </div>
            <CardHeader>
              <CardTitle>Creator</CardTitle>
              <div className="text-3xl font-bold mt-2">9.99€</div>
              <CardDescription>par mois</CardDescription>
            </CardHeader>
            <CardContent>
              <ul className="space-y-2 text-sm">
                <li>✓ 20 vidéos par mois</li>
                <li>✓ Export 4K</li>
                <li>✓ 10 clips par vidéo</li>
                <li>✓ Traductions multilingues</li>
                <li>✓ Styles sous-titres avancés</li>
              </ul>
              <Link href="/login" className="block mt-6">
                <Button className="w-full">
                  Commencer
                </Button>
              </Link>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Pro</CardTitle>
              <div className="text-3xl font-bold mt-2">24.99€</div>
              <CardDescription>par mois</CardDescription>
            </CardHeader>
            <CardContent>
              <ul className="space-y-2 text-sm">
                <li>✓ Vidéos illimitées</li>
                <li>✓ Export 8K</li>
                <li>✓ 20 clips par vidéo</li>
                <li>✓ Priorité processing</li>
                <li>✓ API access</li>
              </ul>
              <Link href="/login" className="block mt-6">
                <Button className="w-full">
                  Commencer
                </Button>
              </Link>
            </CardContent>
          </Card>
        </div>
      </section>

      {/* CTA */}
      <section className="container mx-auto px-4 py-20 text-center">
        <div className="max-w-2xl mx-auto">
          <h2 className="text-3xl font-bold mb-4">Prêt à créer des clips viraux ?</h2>
          <p className="text-gray-600 mb-8">
            Rejoignez des milliers de créateurs qui utilisent ViralReels pour maximiser leur portée.
          </p>
          <Link href="/login">
            <Button size="lg" className="text-lg px-8">
              Commencer gratuitement
            </Button>
          </Link>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t bg-gray-50">
        <div className="container mx-auto px-4 py-8">
          <div className="flex justify-between items-center">
            <div className="flex items-center gap-2">
              <div className="w-6 h-6 bg-gradient-to-br from-purple-600 to-pink-600 rounded" />
              <span className="font-semibold">ViralReels</span>
            </div>
            <div className="text-sm text-gray-600">
              © 2026 ViralReels. Tous droits réservés.
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}
