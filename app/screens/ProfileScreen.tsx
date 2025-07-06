import React, { useMemo, useCallback } from "react";
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Dimensions,
  Alert,
} from "react-native";
import { useNavigation, DrawerActions } from "@react-navigation/native";
import {
  List,
  User,
  TrendUp,
  Calendar,
  Clock,
  CheckCircle,
  Trophy,
  Target,
  ChartLine,
} from "phosphor-react-native";
import { usePrompt, Prompt } from "../context/PromptContext";
import AppText from "../components/AppText";

const { width } = Dimensions.get("window");

/**
 * 👤 Écran de profil utilisateur optimisé avec statistiques avancées
 *
 * 🔧 Fonctionnalités :
 * - Système de niveaux gamifié basé sur l'activité
 * - Statistiques détaillées avec métriques intelligentes
 * - Graphique d'activité des 7 derniers jours
 * - Analyse des tendances d'utilisation
 * - Objectifs et achievements (badges)
 * - Informations de progression personnalisées
 */
export default function ProfileScreen() {
  const navigation = useNavigation();
  const { prompts } = usePrompt();

  /**
   * 📊 Calcul optimisé et intelligent des statistiques utilisateur
   */
  const userStats = useMemo(() => {
    const totalPrompts = prompts.length;
    const executedPrompts = prompts.filter(
      (p) => p.response && p.response !== ""
    ).length;
    const scheduledPrompts = prompts.filter((p) => p.scheduled).length;

    // Statistiques temporelles
    const today = new Date().toISOString().split("T")[0];
    const todayPrompts = prompts.filter((p) => {
      return p.updatedAt.startsWith(today) && p.response;
    }).length;

    // Calcul de la date du premier prompt et ancienneté
    const dates = prompts
      .filter((p) => p.updatedAt)
      .map((p) => new Date(p.updatedAt))
      .sort((a, b) => a.getTime() - b.getTime());

    const firstPromptDate = dates.length > 0 ? dates[0] : null;
    const daysSinceFirst = firstPromptDate
      ? Math.ceil(
          (Date.now() - firstPromptDate.getTime()) / (1000 * 60 * 60 * 24)
        )
      : 0;

    // Statistiques avancées
    const averagePerDay =
      daysSinceFirst > 0 ? executedPrompts / daysSinceFirst : 0;
    const weeklyAverage = averagePerDay * 7;

    // Analyse des sources les plus utilisées
    const sources = prompts
      .filter((p) => p.source && p.source !== "" && p.source !== "Planifié")
      .map((p) => p.source);

    const mostUsedSource =
      sources.length > 0
        ? sources.reduce((a, b, i, arr) =>
            arr.filter((v) => v === a).length >=
            arr.filter((v) => v === b).length
              ? a
              : b
          )
        : "Aucune";

    // Analyse de la récurrence
    const recurringPrompts = prompts.filter(
      (p) => p.scheduled?.isRecurring
    ).length;
    const oneTimePrompts = prompts.filter(
      (p) => p.scheduled && !p.scheduled.isRecurring
    ).length;

    return {
      totalPrompts,
      executedPrompts,
      scheduledPrompts,
      todayPrompts,
      daysSinceFirst,
      averagePerDay: averagePerDay.toFixed(1),
      weeklyAverage: weeklyAverage.toFixed(1),
      mostUsedSource,
      recurringPrompts,
      oneTimePrompts,
      firstPromptDate,
    };
  }, [prompts]);

  /**
   * 🏆 Système de niveaux gamifié avec progression
   */
  const userLevel = useMemo(() => {
    const { executedPrompts } = userStats;

    if (executedPrompts >= 100)
      return {
        level: "Expert IA",
        icon: "🏆",
        color: "#FFD700",
        progress: 100,
        nextLevel: null,
        description: "Maître de l'IA conversationnelle",
      };
    if (executedPrompts >= 50)
      return {
        level: "Utilisateur Avancé",
        icon: "🥇",
        color: "#81b0ff",
        progress: (executedPrompts / 100) * 100,
        nextLevel: "Expert IA dans " + (100 - executedPrompts) + " prompts",
        description: "Utilisateur expérimenté",
      };
    if (executedPrompts >= 20)
      return {
        level: "Explorateur",
        icon: "🥈",
        color: "#C0C0C0",
        progress: (executedPrompts / 50) * 100,
        nextLevel:
          "Utilisateur Avancé dans " + (50 - executedPrompts) + " prompts",
        description: "Découvre les possibilités",
      };
    if (executedPrompts >= 5)
      return {
        level: "Apprenti",
        icon: "🥉",
        color: "#CD7F32",
        progress: (executedPrompts / 20) * 100,
        nextLevel: "Explorateur dans " + (20 - executedPrompts) + " prompts",
        description: "Premiers pas avec l'IA",
      };
    return {
      level: "Débutant",
      icon: "🌱",
      color: "#90EE90",
      progress: (executedPrompts / 5) * 100,
      nextLevel: "Apprenti dans " + (5 - executedPrompts) + " prompts",
      description: "Bienvenue dans Prism !",
    };
  }, [userStats]);

  /**
   * 📈 Données optimisées pour le graphique d'activité hebdomadaire
   */
  const activityData = useMemo(() => {
    const last7Days = [];
    const maxActivity = 10; // Pour normaliser la hauteur des barres

    for (let i = 6; i >= 0; i--) {
      const date = new Date();
      date.setDate(date.getDate() - i);

      const dayPrompts = prompts.filter((p) => {
        const promptDate = p.updatedAt.split("T")[0];
        const targetDate = date.toISOString().split("T")[0];
        return promptDate === targetDate && p.response;
      }).length;

      last7Days.push({
        day: date.toLocaleDateString("fr-FR", { weekday: "short" }),
        fullDate: date.toLocaleDateString("fr-FR"),
        count: dayPrompts,
        isToday: i === 0,
      });
    }

    return last7Days;
  }, [prompts]);

  /**
   * 🎯 Calcul des achievements/badges utilisateur
   */
  const achievements = useMemo(() => {
    const { executedPrompts, scheduledPrompts, todayPrompts, daysSinceFirst } =
      userStats;
    const badges = [];

    if (executedPrompts >= 1)
      badges.push({ icon: "🎯", name: "Premier Prompt", earned: true });
    if (executedPrompts >= 10)
      badges.push({ icon: "🔟", name: "Explorateur", earned: true });
    if (executedPrompts >= 25)
      badges.push({ icon: "⭐", name: "Régulier", earned: true });
    if (executedPrompts >= 50)
      badges.push({ icon: "💎", name: "Expert", earned: true });
    if (scheduledPrompts >= 1)
      badges.push({ icon: "⏰", name: "Planificateur", earned: true });
    if (scheduledPrompts >= 5)
      badges.push({ icon: "📅", name: "Organisé", earned: true });
    if (todayPrompts >= 3)
      badges.push({ icon: "🔥", name: "Actif Aujourd'hui", earned: true });
    if (daysSinceFirst >= 7)
      badges.push({ icon: "📆", name: "Une Semaine", earned: true });
    if (daysSinceFirst >= 30)
      badges.push({ icon: "🏃", name: "Un Mois", earned: true });

    // Badges à débloquer
    if (executedPrompts < 10)
      badges.push({ icon: "🔟", name: "Explorateur", earned: false });
    if (executedPrompts < 25)
      badges.push({ icon: "⭐", name: "Régulier", earned: false });
    if (executedPrompts < 50)
      badges.push({ icon: "💎", name: "Expert", earned: false });
    if (scheduledPrompts < 1)
      badges.push({ icon: "⏰", name: "Planificateur", earned: false });

    return badges.slice(0, 8); // Limiter à 8 badges pour l'affichage
  }, [userStats]);

  /**
   * 📊 Affichage des statistiques détaillées dans une modal
   */
  const showDetailedStats = useCallback(() => {
    Alert.alert(
      "📊 Statistiques complètes",
      `🎯 Prompts totaux : ${userStats.totalPrompts}\n` +
        `✅ Prompts exécutés : ${userStats.executedPrompts}\n` +
        `📅 Prompts planifiés : ${userStats.scheduledPrompts}\n` +
        `🔄 Récurrents : ${userStats.recurringPrompts}\n` +
        `⏰ Ponctuels : ${userStats.oneTimePrompts}\n` +
        `📈 Moyenne/jour : ${userStats.averagePerDay}\n` +
        `📊 Moyenne/semaine : ${userStats.weeklyAverage}\n` +
        `🌐 Source préférée : ${userStats.mostUsedSource}\n` +
        `📆 Membre depuis : ${userStats.daysSinceFirst} jours`,
      [{ text: "OK" }]
    );
  }, [userStats]);

  return (
    <View style={styles.container}>
      {/* Header avec navigation */}
      <View style={styles.header}>
        <TouchableOpacity
          onPress={() => navigation.dispatch(DrawerActions.openDrawer())}
          accessibilityLabel="Ouvrir le menu de navigation"
          accessibilityRole="button"
        >
          <List size={26} color="#fff" />
        </TouchableOpacity>
        <AppText style={styles.headerTitle} bold>
          Mon Profil
        </AppText>
      </View>

      <ScrollView
        style={styles.content}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}
      >
        {/* Section Avatar et Niveau */}
        <View style={styles.profileHeader}>
          <View
            style={[styles.avatarContainer, { borderColor: userLevel.color }]}
          >
            <User size={48} color={userLevel.color} weight="bold" />
          </View>

          <AppText style={styles.userName} bold>
            Utilisateur Prism
          </AppText>

          <View
            style={[
              styles.levelBadge,
              { backgroundColor: userLevel.color + "20" },
            ]}
          >
            <Text style={styles.levelIcon}>{userLevel.icon}</Text>
            <AppText
              style={[styles.levelText, { color: userLevel.color }]}
              bold
            >
              {userLevel.level}
            </AppText>
          </View>

          <AppText style={styles.levelDescription}>
            {userLevel.description}
          </AppText>

          {/* Barre de progression vers le niveau suivant */}
          {userLevel.nextLevel && (
            <View style={styles.progressContainer}>
              <View style={styles.progressBar}>
                <View
                  style={[
                    styles.progressFill,
                    {
                      width: `${userLevel.progress}%`,
                      backgroundColor: userLevel.color,
                    },
                  ]}
                />
              </View>
              <AppText style={styles.progressText}>
                {userLevel.nextLevel}
              </AppText>
            </View>
          )}
        </View>

        {/* Statistiques principales en grille */}
        <View style={styles.statsGrid}>
          <TouchableOpacity style={styles.statCard} onPress={showDetailedStats}>
            <CheckCircle size={24} color="#4CAF50" weight="bold" />
            <AppText style={styles.statNumber} bold>
              {userStats.executedPrompts}
            </AppText>
            <AppText style={styles.statLabel}>Prompts exécutés</AppText>
          </TouchableOpacity>

          <View style={styles.statCard}>
            <Calendar size={24} color="#81b0ff" weight="bold" />
            <AppText style={styles.statNumber} bold>
              {userStats.scheduledPrompts}
            </AppText>
            <AppText style={styles.statLabel}>Prompts planifiés</AppText>
          </View>

          <View style={styles.statCard}>
            <Clock size={24} color="#FF9800" weight="bold" />
            <AppText style={styles.statNumber} bold>
              {userStats.todayPrompts}
            </AppText>
            <AppText style={styles.statLabel}>Aujourd'hui</AppText>
          </View>

          <View style={styles.statCard}>
            <TrendUp size={24} color="#E91E63" weight="bold" />
            <AppText style={styles.statNumber} bold>
              {userStats.averagePerDay}
            </AppText>
            <AppText style={styles.statLabel}>Par jour</AppText>
          </View>
        </View>

        {/* Section Activité hebdomadaire */}
        <View style={styles.activitySection}>
          <View style={styles.sectionHeader}>
            <ChartLine size={24} color="#81b0ff" weight="bold" />
            <AppText style={styles.sectionTitle} bold>
              Activité (7 derniers jours)
            </AppText>
          </View>

          <View style={styles.activityChart}>
            {activityData.map((day, index) => (
              <View key={index} style={styles.activityDay}>
                <View
                  style={[
                    styles.activityBar,
                    {
                      height: Math.max(day.count * 10, 4),
                      backgroundColor: day.isToday
                        ? "#81b0ff"
                        : day.count > 0
                        ? "#81b0ff88"
                        : "#333",
                    },
                  ]}
                />
                <AppText
                  style={[
                    styles.activityLabel,
                    day.isToday && styles.todayLabel,
                  ]}
                >
                  {day.day}
                </AppText>
                <AppText style={styles.activityCount}>{day.count}</AppText>
              </View>
            ))}
          </View>
        </View>

        {/* Section Achievements/Badges */}
        <View style={styles.achievementsSection}>
          <View style={styles.sectionHeader}>
            <Trophy size={24} color="#FFD700" weight="bold" />
            <AppText style={styles.sectionTitle} bold>
              Achievements
            </AppText>
          </View>

          <View style={styles.badgesGrid}>
            {achievements.map((badge, index) => (
              <View
                key={index}
                style={[
                  styles.badge,
                  badge.earned ? styles.badgeEarned : styles.badgeLocked,
                ]}
              >
                <Text style={styles.badgeIcon}>{badge.icon}</Text>
                <AppText
                  style={[
                    styles.badgeName,
                    badge.earned
                      ? styles.badgeNameEarned
                      : styles.badgeNameLocked,
                  ]}
                >
                  {badge.name}
                </AppText>
              </View>
            ))}
          </View>
        </View>

        {/* Section Informations détaillées */}
        <View style={styles.infoSection}>
          <View style={styles.sectionHeader}>
            <Target size={24} color="#81b0ff" weight="bold" />
            <AppText style={styles.sectionTitle} bold>
              Informations
            </AppText>
          </View>

          <View style={styles.infoItem}>
            <AppText style={styles.infoLabel}>Membre depuis</AppText>
            <AppText style={styles.infoValue}>
              {userStats.daysSinceFirst > 0
                ? `${userStats.daysSinceFirst} jours`
                : "Aujourd'hui"}
            </AppText>
          </View>

          <View style={styles.infoItem}>
            <AppText style={styles.infoLabel}>Source préférée</AppText>
            <AppText style={styles.infoValue}>
              {userStats.mostUsedSource}
            </AppText>
          </View>

          <View style={styles.infoItem}>
            <AppText style={styles.infoLabel}>Moyenne hebdomadaire</AppText>
            <AppText style={styles.infoValue}>
              {userStats.weeklyAverage} prompts
            </AppText>
          </View>

          {userStats.firstPromptDate && (
            <View style={styles.infoItem}>
              <AppText style={styles.infoLabel}>Premier prompt</AppText>
              <AppText style={styles.infoValue}>
                {userStats.firstPromptDate.toLocaleDateString("fr-FR")}
              </AppText>
            </View>
          )}
        </View>
      </ScrollView>
    </View>
  );
}

/**
 * 🎨 Styles optimisés pour une interface de profil moderne et engageante
 */
const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#1E1E1E",
  },

  header: {
    flexDirection: "row",
    alignItems: "center",
    paddingTop: 50,
    paddingHorizontal: 16,
    paddingBottom: 20,
  },

  headerTitle: {
    fontSize: 20,
    color: "#fff",
    marginLeft: 16,
  },

  content: {
    flex: 1,
  },

  scrollContent: {
    padding: 16,
    paddingBottom: 40,
  },

  profileHeader: {
    alignItems: "center",
    marginBottom: 32,
  },

  avatarContainer: {
    width: 90,
    height: 90,
    borderRadius: 45,
    backgroundColor: "#252525",
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 16,
    borderWidth: 3,
  },

  userName: {
    fontSize: 26,
    color: "#fff",
    marginBottom: 8,
  },

  levelBadge: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: 25,
    marginBottom: 8,
  },

  levelIcon: {
    fontSize: 24,
    marginRight: 10,
  },

  levelText: {
    fontSize: 18,
    fontWeight: "bold",
  },

  levelDescription: {
    fontSize: 14,
    color: "#888",
    textAlign: "center",
    marginBottom: 16,
  },

  progressContainer: {
    width: "80%",
    alignItems: "center",
  },

  progressBar: {
    width: "100%",
    height: 6,
    backgroundColor: "#333",
    borderRadius: 3,
    marginBottom: 8,
  },

  progressFill: {
    height: "100%",
    borderRadius: 3,
  },

  progressText: {
    fontSize: 12,
    color: "#888",
    textAlign: "center",
  },

  statsGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    justifyContent: "space-between",
    marginBottom: 32,
  },

  statCard: {
    width: (width - 48) / 2,
    backgroundColor: "#252525",
    padding: 20,
    borderRadius: 16,
    alignItems: "center",
    marginBottom: 12,
    borderWidth: 1,
    borderColor: "rgba(255, 255, 255, 0.06)",
  },

  statNumber: {
    fontSize: 32,
    color: "#fff",
    marginVertical: 8,
  },

  statLabel: {
    fontSize: 12,
    color: "#888",
    textAlign: "center",
    lineHeight: 16,
  },

  activitySection: {
    marginBottom: 32,
  },

  sectionHeader: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 16,
  },

  sectionTitle: {
    fontSize: 18,
    color: "#fff",
    marginLeft: 12,
  },

  activityChart: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-end",
    backgroundColor: "#252525",
    padding: 20,
    borderRadius: 16,
    height: 140,
    borderWidth: 1,
    borderColor: "rgba(255, 255, 255, 0.06)",
  },

  activityDay: {
    alignItems: "center",
    flex: 1,
  },

  activityBar: {
    width: 16,
    borderRadius: 8,
    marginBottom: 12,
    minHeight: 4,
  },

  activityLabel: {
    fontSize: 10,
    color: "#888",
    marginBottom: 4,
  },

  todayLabel: {
    color: "#81b0ff",
    fontWeight: "bold",
  },

  activityCount: {
    fontSize: 10,
    color: "#81b0ff",
    fontWeight: "bold",
  },

  achievementsSection: {
    marginBottom: 32,
  },

  badgesGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    justifyContent: "space-between",
  },

  badge: {
    width: (width - 48) / 4 - 6,
    aspectRatio: 1,
    backgroundColor: "#252525",
    borderRadius: 12,
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 8,
    borderWidth: 1,
  },

  badgeEarned: {
    borderColor: "#FFD700",
    backgroundColor: "#FFD70020",
  },

  badgeLocked: {
    borderColor: "#333",
    backgroundColor: "#252525",
  },

  badgeIcon: {
    fontSize: 20,
    marginBottom: 4,
  },

  badgeName: {
    fontSize: 8,
    textAlign: "center",
    lineHeight: 10,
  },

  badgeNameEarned: {
    color: "#FFD700",
    fontWeight: "bold",
  },

  badgeNameLocked: {
    color: "#666",
  },

  infoSection: {
    marginBottom: 32,
  },

  infoItem: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    backgroundColor: "#252525",
    padding: 16,
    borderRadius: 12,
    marginBottom: 8,
    borderWidth: 1,
    borderColor: "rgba(255, 255, 255, 0.06)",
  },

  infoLabel: {
    fontSize: 16,
    color: "#888",
  },

  infoValue: {
    fontSize: 16,
    color: "#fff",
    fontWeight: "600",
  },
});

/**
 * 📚 FONCTIONNALITÉS AVANCÉES DU PROFILE SCREEN
 *
 * ✅ GAMIFICATION COMPLÈTE :
 * - Système de niveaux avec progression visuelle
 * - Badges/achievements basés sur l'activité réelle
 * - Barres de progression vers le niveau suivant
 * - Couleurs dynamiques selon le niveau
 *
 * ✅ ANALYTICS AVANCÉES :
 * - Statistiques temporelles (quotidien, hebdomadaire)
 * - Analyse des sources préférées
 * - Tendances d'utilisation personnalisées
 * - Métriques de performance intelligentes*/
