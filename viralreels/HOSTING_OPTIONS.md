#!/bin/bash
# ViralReels VPS Setup Script
# Pour Ubuntu 22.04 LTS

set -e

echo "🚀 Installation de ViralReels sur VPS..."

# 1. Mise à jour système
echo "📦 Mise à jour du système..."
sudo apt update && sudo apt upgrade -y

# 2. Installation Node.js 22
echo "📦 Installation Node.js 22..."
curl -fsSL https://deb.nodesource.com/setup_22.x | sudo -E bash -
sudo apt install -y nodejs

# 3. Installation Docker
echo "🐳 Installation Docker..."
curl -fsSL https://get.docker.com -o get-docker.sh
sudo sh get-docker.sh
sudo usermod -aG docker $USER
sudo systemctl enable docker
sudo systemctl start docker

# 4. Installation Docker Compose
echo "🐳 Installation Docker Compose..."
sudo curl -L "https://github.com/docker/compose/releases/latest/download/docker-compose-$(uname -s)-$(uname -m)" -o /usr/local/bin/docker-compose
sudo chmod +x /usr/local/bin/docker-compose

# 5. Installation Nginx
echo "🌐 Installation Nginx..."
sudo apt install -y nginx
sudo systemctl enable nginx
sudo systemctl start nginx

# 6. Installation Certbot (SSL)
echo "🔒 Installation Certbot..."
sudo apt install -y certbot python3-certbot-nginx

# 7. Installation PM2 (Process Manager)
echo "📦 Installation PM2..."
sudo npm install -g pm2

# 8. Installation FFmpeg
echo "🎬 Installation FFmpeg..."
sudo apt install -y ffmpeg

# 9. Créer le dossier de l'application
echo "📁 Création du dossier app..."
sudo mkdir -p /var/www/viralreels
sudo chown -R $USER:$USER /var/www/viralreels

echo "✅ Installation de base terminée !"
echo ""
echo "Prochaines étapes :"
echo "1. Cloner le repository dans /var/www/viralreels"
echo "2. Configurer les variables d'environnement"
echo "3. Configurer Nginx"
echo "4. Obtenir un certificat SSL"
echo "5. Démarrer l'application avec PM2"
echo ""
echo "Voir VPS_DEPLOYMENT.md pour les instructions complètes"
