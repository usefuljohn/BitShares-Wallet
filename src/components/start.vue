<script setup>
    import { ref, onMounted, computed } from 'vue';

    import { useI18n } from 'vue-i18n';
    const { t } = useI18n({ useScope: 'global' });

    import store from '../store/index.js';
    import router from '../router/index.js';

    let loading = ref(true);

    let hasWallet = computed(() => {
        return store.getters['WalletStore/getHasWallet'];
    })

    let walletlist = computed(() => {
        return store.getters['WalletStore/getWalletList'];
    })

    let walletOptions = computed(() => {
        let wallets = store.getters['WalletStore/getWalletList'];

        return wallets.map((wallet, i) => {
            return {label: wallet.name, value: i}
        });
    })

    let walletpass = ref("");
    let selectedWallet = ref(0);
    let passincorrect = ref("");

    onMounted(() => {
        store.dispatch("WalletStore/loadWallets", {})
            .catch((error) => {
                console.log({error});
            })
            .finally(() => {
                loading.value = false;
            });
        store.dispatch("OriginStore/loadApps");
    });

    function unlockWallet() {
        store
            .dispatch("WalletStore/getWallet", {
                wallet_id: walletlist.value[selectedWallet.value].id,
                wallet_pass: walletpass.value
            })
            .then(async () => {
                try {
                    await store.dispatch("WalletStore/confirmUnlock");
                } catch (error) {
                    console.log(error);
                    return;
                }
                store.dispatch("WalletStore/setSelectedWalletIndex", selectedWallet.value);
                walletpass.value = "";
                router.replace("/dashboard");
            })
            .catch(() => {
                passincorrect.value = "is-invalid";
                window.electron.notify(t('common.start.invalid_password'));
            });
    }
</script>

<template>
    <div class="bottom">
        <div class="content">
            <!-- Loading state while DB is being queried -->
            <div
                v-if="loading"
                style="display: flex; flex-direction: column; align-items: center; padding: 20px;"
            >
                <ui-spinner active />
                <p class="mt-2 font-weight-normal" style="color: #888;">
                    Loading wallet...
                </p>
            </div>

            <!-- No wallet found after loading -->
            <p
                v-if="!loading && !hasWallet"
                class="mt-3 mb-3 font-weight-normal"
            >
                <em>{{ t('common.no_wallet') }}</em>
            </p>

            <router-link
                v-if="!loading && !hasWallet"
                to="/create"
                replace
            >
                <ui-button raised>
                    {{ t('common.start_cta') }}
                </ui-button>
            </router-link>

            <p
                v-if="!loading && !hasWallet"
                class="my-2 font-weight-normal"
            >
                <em>{{ t('common.restore_lbl') }}</em>
            </p>

            <router-link
                v-if="!loading && !hasWallet"
                to="/restore"
                replace
            >
                <ui-button raised>
                    {{ t('common.restore_cta') }}
                </ui-button>
            </router-link>

            <!-- Wallet found — show unlock UI -->
            <section :dir="null">
                <ui-select
                    v-if="!loading && hasWallet"
                    id="wallet-select"
                    v-model="selectedWallet"
                    style="width:100%"
                    :options="walletOptions"
                    full-bleed
                    @change="passincorrect=''"
                >
                    {{ t('common.start.wallet_name') }}
                </ui-select>
            </section>
            <input
                v-if="!loading && hasWallet"
                id="inputPassword"
                v-model="walletpass"
                style="width:97%; margin-top: 5px;"
                type="password"
                class="form-control mb-4 px-3"
                :placeholder=" t('common.password_placeholder')"
                required
                :class="passincorrect"
                @keypress.enter="unlockWallet"
                @focus="passincorrect=''"
            >
            <br>
            <ui-button
                v-if="!loading && hasWallet"
                type="submit"
                raised
                style="margin-top: 10px; margin-bottom: 5px;"
                @click="unlockWallet"
            >
                {{ t('common.unlock_cta') }}
            </ui-button>

            <ui-divider v-if="!loading" class="divider" />

            <router-link
                v-if="!loading && hasWallet"
                to="/create"
                replace
            >
                <ui-button
                    class="step_btn"
                    raised
                >
                    {{ t('common.create_cta') }}
                </ui-button>
            </router-link>
            <router-link
                v-if="!loading && hasWallet"
                to="/restore"
                replace
            >
                <ui-button
                    class="step_btn"
                    raised
                >
                    {{ t('common.restore_cta') }}
                </ui-button>
            </router-link>
        </div>
        <p class="mt-2 mb-2 small">
            &copy; 2019-2026 BitShares
        </p>
    </div>
</template>

