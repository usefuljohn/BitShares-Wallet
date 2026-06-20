<script setup>
    import { ref, computed, watch, onMounted } from "vue";
    import { useI18n } from "vue-i18n";

    import router from "../router/index.js";
    import store from "../store/index.js";
    import langSelect from "./lang-select.vue";
    import { useSigningHandlers } from "../composables/useSigningHandlers.js";

    let open = ref(false);
    let lastIndex = ref(0);
    const { t } = useI18n({ useScope: "global" });

    let items = computed(() => {
        return [
            {
                text: t("common.actionBar.Home"),
                index: 0,
                icon: "home",
                url: "/dashboard"
            },
            {
                text: t("common.actionBar.New"),
                index: 1,
                icon: "add",
                url: "/add-account"
            },
            {
                text: t("common.actionBar.Local"),
                index: 2,
                icon: "upload",
                url: "/local"
            },
            {
                text: t("common.actionBar.RAW"),
                index: 3,
                icon: "raw_on",
                url: "/raw-link"
            },
            {
                text: t("common.actionBar.dapps"),
                index: 4,
                icon: "app_registration",
                url: "/dapps"
            },
            {
                text: t("common.actionBar.Backup"),
                index: 5,
                icon: "download",
                url: "/backup"
            },
            {
                text: t("common.actionBar.Settings"),
                index: 6,
                icon: "settings",
                url: "/settings"
            },
            {
                text: t("common.actionBar.changeNodes"),
                index: 7,
                icon: "lan",
                url: "/nodes"
            },
            {
                text: t("common.actionBar.Logout"),
                index: 8,
                icon: "logout",
                url: "/"
            }
        ]
    });

    const hexToString = (hex) => {
        const bytes = new Uint8Array(hex.match(/.{1,2}/g).map(byte => parseInt(byte, 16)));
        return new TextDecoder().decode(bytes);
    };

    function onChange(data) {
        lastIndex.value = data.index;

        if (data.index === 8) {
            console.log("User logged out.");
            store.dispatch("WalletStore/logout");
            router.replace("/");
        }

        router.replace(items.value[data.index].url);
    }

    let logoutTimer = null;
    function startLogoutTimer(newValue) {
        if (logoutTimer) {
            clearTimeout(logoutTimer);
        }

        const minutes = store.getters['SettingsStore/getAutoLockMinutes'] || 10;
        logoutTimer = setTimeout(() => {
            console.log("wallet timed logout");
            store.dispatch("WalletStore/logout");
            router.replace("/");
        }, minutes * 60 * 1000);
    }

    watch(
        lastIndex,
        (newValue, oldValue) => {
            if (items.value[oldValue]) {
                console.log(
                    `User navigated from ${items.value[oldValue].text} to ${items.value[newValue].text}`
                );
            } else if (newValue === oldValue) {
                console.log(`Page ${items.value[newValue].text} is in use...`);
            }

            const { registerSigningListeners, removeSigningListeners } = useSigningHandlers(store, t, hexToString);

            removeSigningListeners();

            if (
                store.state.WalletStore.isUnlocked &&
                [2, 3].includes(newValue)
            ) {
                registerSigningListeners();
            }
            startLogoutTimer(newValue);
        },
        { immediate: true }
    );

    watch(
        () => router.currentRoute.value,
        (newRoute) => {
            const matchingItem = items.value.find(
                (item) => item.url === newRoute.path
            );
            if (matchingItem) {
                lastIndex.value = matchingItem.index;
            }
        }
    );

    watch(
        () => store.state.WalletStore.isUnlocked,
        (isUnlocked) => {
            if (isUnlocked) {
                window.electron.timer(() => startLogoutTimer(lastIndex.value));
                window.electron.setNode((data) => {
                    const _currentChain = store.getters["AccountStore/getChain"];
                    store.dispatch("SettingsStore/setNode", {
                        chain: _currentChain,
                        node: data,
                    });
                });
                window.electron.onGetSafeAccount((arg) => {
                    let account =
                        store.getters["AccountStore/getCurrentSafeAccount"]();
                    window.electron.getSafeAccountResponse(account);
                });
            }
        },
        { immediate: true }
    );
</script>

<template>
    <div>
        <ui-menu-anchor
            absolute
            position="BOTTOM_START"
        >
            <ui-fab
                v-if="store.state.WalletStore.isUnlocked"
                style="margin-bottom: 10px"
                icon="menu"
                mini
                @click="open = true"
            />
            <langSelect location="small" />

            <ui-menu
                v-model="open"
                style="border: 1px solid #c7088e"
                position="BOTTOM_START"
                @selected="onChange"
            >
                <ui-menuitem
                    v-for="item in items"
                    :key="item.icon"
                    nested
                >
                    <ui-menuitem
                        v-if="lastIndex === item.index"
                        selected
                    >
                        <ui-menuitem-icon dark>
                            <ui-icon style="color: #707070">
                                {{ item.icon }}
                            </ui-icon>
                        </ui-menuitem-icon>
                        <ui-menuitem-text>{{ item.text }}</ui-menuitem-text>
                    </ui-menuitem>
                    <ui-menuitem v-else>
                        <ui-menuitem-icon dark>
                            <ui-icon
                                dark
                                style="visibility: visible"
                            >
                                {{ item.icon }}
                            </ui-icon>
                        </ui-menuitem-icon>
                        <ui-menuitem-text>{{ item.text }}</ui-menuitem-text>
                    </ui-menuitem>
                </ui-menuitem>
            </ui-menu>
        </ui-menu-anchor>
    </div>
</template>
