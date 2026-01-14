function appData() {
  return {
    templates: [],
    modalOpen: false,
    selectedTemplate: { stats: {} },
    quickviewOpen: false,
    selectedQuickview: {},
    errorModalOpen: false,
    errorTitle: "Error",
    errorMessage: "",
    search: "",
    category: "all",
    filterTag: "",
    currentPage: 1,
    itemsPerPage: 6,
    favorites: JSON.parse(
      localStorage.getItem("abelrgr_templates_favorites") || "[]"
    ),
    userRatings: JSON.parse(
      localStorage.getItem("abelrgr_templates_userRatings") || "{}"
    ),
    ratingCooldowns: JSON.parse(
      localStorage.getItem("abelrgr_templates_ratingCooldowns") || "{}"
    ),
    darkMode:
      localStorage.getItem("abelrgr_templates_darkMode") === "true" ||
      (!("abelrgr_templates_darkMode" in localStorage) &&
        window.matchMedia("(prefers-color-scheme: dark)").matches),
    showBackToTop: false,
    showHeaderSearch: false,
    countdownDays: 30,
    countdownHours: 0,
    countdownMinutes: 0,
    countdownSeconds: 0,
    countdownTargetDate: null,

    init() {
      if (window.backendData) {
        this.templates = window.backendData.templates;
        this.countdownTargetDate = window.backendData.countdownTargetDate;
      }

      this.$watch("darkMode", (val) =>
        localStorage.setItem("abelrgr_templates_darkMode", val)
      );
      this.$watch("favorites", (val) =>
        localStorage.setItem("abelrgr_templates_favorites", JSON.stringify(val))
      );
      this.$watch("userRatings", (val) =>
        localStorage.setItem(
          "abelrgr_templates_userRatings",
          JSON.stringify(val)
        )
      );
      this.$watch("ratingCooldowns", (val) =>
        localStorage.setItem(
          "abelrgr_templates_ratingCooldowns",
          JSON.stringify(val)
        )
      );
      this.$watch("search", (value) => {
        this.currentPage = 1;
        if (value.trim().length > 0) {
          const templatesSection = document.getElementById("templates");
          if (templatesSection) {
            const yOffset = -100; // Offset to account for sticky header
            const y =
              templatesSection.getBoundingClientRect().top +
              window.scrollY +
              yOffset;
            window.scrollTo({ top: y, behavior: "smooth" });
          }
        }
      });
      this.$watch("category", () => (this.currentPage = 1));
      this.$watch("filterTag", () => (this.currentPage = 1));

      // Back to top button
      window.addEventListener("scroll", () => {
        this.showBackToTop = window.scrollY > 300;
      });

      const heroSearch = document.getElementById("hero-search-container");
      if (heroSearch) {
        const observer = new IntersectionObserver(
          (entries) => {
            entries.forEach((entry) => {
              this.showHeaderSearch = !entry.isIntersecting;
            });
          },
          { threshold: 0 }
        );
        observer.observe(heroSearch);
      }

      // Countdown timer
      this.startCountdown();
    },

    toggleDarkMode() {
      this.darkMode = !this.darkMode;
    },

    scrollToTop() {
      window.scrollTo({ top: 0, behavior: "smooth" });
    },

    getCategories() {
      const cats = new Set(
        this.templates.map((t) => t.category).filter(Boolean)
      );
      return Array.from(cats);
    },

    getTopTags(limit = 8) {
      const tagCounts = {};
      this.templates.forEach((t) => {
        if (t.tags) {
          t.tags.forEach((tag) => {
            tagCounts[tag] = (tagCounts[tag] || 0) + 1;
          });
        }
      });
      return Object.entries(tagCounts)
        .sort((a, b) => b[1] - a[1])
        .slice(0, limit)
        .map((entry) => entry[0]);
    },

    get filteredTemplates() {
      return this.templates.filter((t) => {
        const query = this.search.toLowerCase();
        const matchesSearch =
          t.title.toLowerCase().includes(query) ||
          t.description.toLowerCase().includes(query) ||
          (t.tags && t.tags.some((tag) => tag.toLowerCase().includes(query)));

        const matchesCategory =
          this.category === "all" || t.category === this.category;

        const matchesTag =
          !this.filterTag ||
          (t.tags &&
            t.tags.some(
              (tag) => tag.toLowerCase() === this.filterTag.toLowerCase()
            ));

        return matchesSearch && matchesCategory && matchesTag;
      });
    },

    get relatedTemplates() {
      if (!this.selectedTemplate || !this.selectedTemplate.tags) return [];
      const currentTags = this.selectedTemplate.tags;
      return this.templates
        .filter((t) => t.folder !== this.selectedTemplate.folder)
        .map((t) => {
          const commonTags = t.tags.filter((tag) => currentTags.includes(tag));
          return { ...t, score: commonTags.length };
        })
        .filter((t) => t.score > 0)
        .sort((a, b) => b.score - a.score)
        .slice(0, 3);
    },

    setFilterTag(tag) {
      if (this.filterTag === tag) {
        this.filterTag = "";
      } else {
        this.filterTag = tag;
        this.category = "all";
      }
      this.closeModal();
      this.closeQuickview();
      // Scroll to templates section
      document
        .getElementById("templates")
        ?.scrollIntoView({ behavior: "smooth" });
    },

    get paginatedTemplates() {
      const start = (this.currentPage - 1) * this.itemsPerPage;
      return this.filteredTemplates.slice(start, start + this.itemsPerPage);
    },

    get totalPages() {
      return Math.ceil(this.filteredTemplates.length / this.itemsPerPage);
    },

    get formattedTargetDate() {
      if (!this.countdownTargetDate) return "";
      const date = new Date(this.countdownTargetDate);
      return date.toLocaleDateString("en-US", {
        year: "numeric",
        month: "long",
        day: "numeric",
      });
    },

    formatDate(dateStr) {
      if (!dateStr) return "";
      const date = new Date(dateStr);
      if (isNaN(date.getTime())) return "";
      return new Intl.DateTimeFormat(navigator.language).format(date);
    },

    openModal(template) {
      this.selectedTemplate = template;
      this.modalOpen = true;
      this.trackView(template.folder);
    },

    closeModal() {
      this.modalOpen = false;
    },

    openQuickview(template) {
      this.selectedQuickview = template;
      this.quickviewOpen = true;
    },

    closeQuickview() {
      this.quickviewOpen = false;
    },

    showErrorModal(message, title = "Error") {
      this.errorTitle = title;
      this.errorMessage = message;
      this.errorModalOpen = true;
    },

    closeErrorModal() {
      this.errorModalOpen = false;
    },

    async trackView(folder) {
      try {
        await fetch(`/api/view/${folder}`, { method: "POST" });
        const t = this.templates.find((t) => t.folder === folder);
        if (t) t.stats.views++;
      } catch (e) {}
    },

    async handleDownload(folder) {
      try {
        // First, check if download is allowed by making a request
        const response = await fetch(`/download/${folder}`);

        if (response.status === 429) {
          // Rate limit exceeded
          const data = await response.json();
          this.showErrorModal(data.message, "Download Limit Exceeded");
          return false;
        } else if (!response.ok) {
          // Other error
          const data = await response.json();
          this.showErrorModal(
            data.message || "Download failed",
            "Download Error"
          );
          return false;
        }

        // Download successful - proceed with actual file download
        const blob = await response.blob();
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement("a");
        a.href = url;
        a.download = `${folder}.zip`;
        document.body.appendChild(a);
        a.click();
        window.URL.revokeObjectURL(url);
        document.body.removeChild(a);

        const t = this.templates.find((t) => t.folder === folder);
        if (t) t.stats.downloads++;

        return true;
      } catch (e) {
        console.error("Download error:", e);
        this.showErrorModal(
          "An error occurred during download",
          "Download Error"
        );
        return false;
      }
    },

    async toggleFavorite(folder) {
      const index = this.favorites.indexOf(folder);
      const action = index === -1 ? "add" : "remove";

      if (action === "add") {
        this.favorites.push(folder);
      } else {
        this.favorites.splice(index, 1);
      }

      try {
        await fetch(`/api/favorite/${folder}`, {
          method: "POST",
          headers: {
            "Content-Type": "application/x-www-form-urlencoded",
          },
          body: `action=${action}`,
        });
        const t = this.templates.find((t) => t.folder === folder);
        if (t) t.stats.favorites += action === "add" ? 1 : -1;
      } catch (e) {}
    },

    isFavorite(folder) {
      return this.favorites.includes(folder);
    },

    async rateTemplate(folder, rating) {
      try {
        // Check if same rating
        const currentRating = this.userRatings[folder];
        if (currentRating === rating) {
          this.showErrorModal(
            "You already gave this rating to this template",
            "Rating Error"
          );
          return;
        }

        // Check cooldown
        const lastRateTime = this.ratingCooldowns[folder] || 0;
        const currentTime = Date.now();
        const timeDiff = Math.floor((currentTime - lastRateTime) / 1000);

        if (timeDiff < 60) {
          const waitSeconds = 60 - timeDiff;
          this.showErrorModal(
            `You can only re-rate a template once per minute. Wait ${waitSeconds} seconds.`,
            "Rating Limit"
          );
          return;
        }

        const response = await fetch(`/api/rate/${folder}`, {
          method: "POST",
          headers: {
            "Content-Type": "application/x-www-form-urlencoded",
          },
          body: `rating=${rating}`,
        });

        const data = await response.json();

        if (!response.ok) {
          this.showErrorModal(
            data.message || "Failed to rate template",
            "Rating Error"
          );
          return;
        }

        // Save user rating and cooldown
        this.userRatings[folder] = rating;
        this.ratingCooldowns[folder] = currentTime;

        // Update template rating
        const t = this.templates.find((t) => t.folder === folder);
        if (t && data.rating !== undefined) {
          t.rating = data.rating;
          t.stats.rating_count = data.rating_count;
          if (
            this.selectedTemplate &&
            this.selectedTemplate.folder === folder
          ) {
            this.selectedTemplate.rating = data.rating;
            this.selectedTemplate.stats.rating_count = data.rating_count;
          }
        }
      } catch (e) {
        console.error("Rating error:", e);
        this.showErrorModal("An error occurred while rating", "Rating Error");
      }
    },

    startCountdown() {
      const updateCountdown = () => {
        const now = new Date();
        const targetDate = new Date(this.countdownTargetDate);
        const diff = targetDate - now;

        if (diff > 0) {
          this.countdownDays = Math.floor(diff / (1000 * 60 * 60 * 24));
          this.countdownHours = Math.floor(
            (diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60)
          );
          this.countdownMinutes = Math.floor(
            (diff % (1000 * 60 * 60)) / (1000 * 60)
          );
          this.countdownSeconds = Math.floor((diff % (1000 * 60)) / 1000);
        } else {
          // Si ya pasó la fecha, mostrar 0
          this.countdownDays = 0;
          this.countdownHours = 0;
          this.countdownMinutes = 0;
          this.countdownSeconds = 0;
        }
      };

      // Actualizar inmediatamente
      updateCountdown();
      // Actualizar cada segundo
      setInterval(updateCountdown, 1000);
    },
  };
}
