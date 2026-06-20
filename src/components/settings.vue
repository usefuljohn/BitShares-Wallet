<script setup>
    import { ref, computed, onMounted } from 'vue';
    import { useI18n } from 'vue-i18n';

    import AccountSelect from "./account-select";

    import store from '../store/index.js';
    import router from '../router/index.js';

    const { t } = useI18n({ useScope: 'global' });

    let walletpass = ref("");
    let passincorrect = ref("");

    let autoLockMinutes = ref(
        store.getters['SettingsStore/getAutoLockMinutes'] || 10
    );

    let autoLockLabel = computed(() => {
        const m = autoLockMinutes.value;
        if (m >= 60) {
            const h = Math.floor(m / 60);
            const r = m % 60;
            return r > 0 ? `${h}h ${r}min` : `${h}h`;
        }
        return `${m} min`;
    });

    let selectedAccount = computed(() => {
        if (!store.state.WalletStore.isUnlocked) {
            return;
        }
        return store.getters["AccountStore/getCurrentSafeAccount"]()
    })

    let accountQuantity = computed(() => {
        if (!store.state.WalletStore.isUnlocked) {
            return 0;
        }
        return store.getters["AccountStore/getAccountQuantity"];
    })

    function updateAutoLock(event) {
        window.electron.resetTimer();
        const minutes = parseInt(event.target.value, 10);
        autoLockMinutes.value = minutes;
        store.dispatch("SettingsStore/setAutoLockMinutes", { minutes });
    }

    async function deleteAccount() {
        if (!store.state.WalletStore.isUnlocked || router.currentRoute.value.path != "/settings") {
            return;
        }
        window.electron.resetTimer();

        store
            .dispatch("WalletStore/deleteAccountFromWallet", {
                accountName: selectedAccount.value.accountName,
                chain: selectedAccount.value.chain,
                wallet_pass: walletpass.value
            })
            .then(async () => {
                window.electron.notify(t('common.settings.deleted'));
                router.replace("/");
                passincorrect.value = "";
                walletpass.value = "";
            })
            .catch(() => {
                passincorrect.value = "is-invalid";
                window.electron.notify(t('common.start.invalid_password'));
            });
    }

    onMounted(() => {
        if (!store.state.WalletStore.isUnlocked) {
            console.log("logging user out...");
            store.dispatch("WalletStore/logout");
            router.replace("/");
            return;
        }
    });
</script>

<template>
    <div
        class="dapp-list mt-2"
        style="text-align: center; margin-top: auto; margin-bottom: auto;"
    >
        <p>
            <u>{{ t('common.settings.label') }}</u>
        </p>
        <AccountSelect />

        <!-- Auto-Lock Timeout Section -->
        <ui-card
            v-shadow="2"
            outlined
            style="margin: 15px auto; max-width: 400px; padding: 15px;"
        >
            <p style="margin-bottom: 5px; font-weight: bold;">
                {{ t('common.settings.autoLock') }}
            </p>
            <p style="margin-bottom: 10px; font-size: 0.9em; color: #888;">
                {{ t('common.settings.autoLockLabel') }}
            </p>
            <div style="display: flex; align-items: center; justify-content: center; gap: 10px;">
                <input
                    id="autoLockSlider"
                    type="range"
                    min="1"
                    max="120"
                    :value="autoLockMinutes"
                    style="width: 200px; cursor: pointer;"
                    @input="updateAutoLock"
                />
                <span style="font-weight: bold; min-width: 80px;">
                    {{ autoLockLabel }}
                </span>
            </div>
        </ui-card>

        <!-- Delete Account Section -->
        <ui-grid
            v-if="accountQuantity && accountQuantity > 1"
            class="row px-4"
        >
            <ui-grid-cell
                class="largeHeader"
                columns="12"
            >
                <p class="small text-justify">
                    {{ t('common.settings.prompt') }}
                </p>
            </ui-grid-cell>
            <ui-grid-cell columns="3" />
            <ui-grid-cell columns="6">
                <input
                    id="inputPassword"
                    v-model="walletpass"
                    style="width:97%;"
                    type="password"
                    class="form-control mb-4 px-3"
                    :placeholder=" t('common.password_placeholder')"
                    required
                    :class="passincorrect"
                    @focus="passincorrect=''"
                >
                <br>
                <ui-button
                    class="step_btn"
                    type="button"
                    raised
                    @click="deleteAccount"
                >
                    {{ t('common.settings.button') }}
                </ui-button><br>
                <router-link
                    :to="'/dashboard'"
                    style="text-decoration: none;"
                    replace
                >
                    <ui-button
                        outlined
                        class="step_btn"
                    >
                        {{ t('common.settings.exit') }}
                    </ui-button>
                </router-link>
            </ui-grid-cell>
            <ui-grid-cell columns="3" />
        </ui-grid>
        <ui-grid
            v-else
            class="row px-4"
        >
            <ui-grid-cell
                class="largeHeader"
                columns="12"
            >
                <p class="small text-justify">
                    {{ t('common.settings.insufficient') }}
                </p>
            </ui-grid-cell>
        </ui-grid>
    </div>
</template>
