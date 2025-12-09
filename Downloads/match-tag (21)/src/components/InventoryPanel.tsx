"use client"

import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Package, ChefHat, History, AlertTriangle, Upload } from "lucide-react"
import { InventoryTable } from "./InventoryTable"
import { RecipeManager } from "./RecipeManager"
import { InventoryMovements } from "./InventoryMovements"
import { InventoryAlerts } from "./InventoryAlerts"
import { Button } from "@/components/ui/button"
import { useT } from "@/src/hooks/useTranslation"

interface InventoryPanelProps {
  barId: string
}

export function InventoryPanel({ barId }: InventoryPanelProps) {
  const t = useT()

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold text-white mb-2">{t("admin.inventoryManagement")}</h2>
        <p className="text-gray-300">{t("admin.completeInventoryControl")}</p>
      </div>


      <Tabs defaultValue="inventory" className="space-y-6">
        <TabsList className="grid w-full grid-cols-4 bg-white/10">
          <TabsTrigger value="inventory" className="data-[state=active]:bg-white/20">
            <Package className="h-4 w-4 mr-2" />
            {t("admin.inventory")}
          </TabsTrigger>
          <TabsTrigger value="recipes" className="data-[state=active]:bg-white/20">
            <ChefHat className="h-4 w-4 mr-2" />
            {t("admin.recipes")}
          </TabsTrigger>
          <TabsTrigger value="movements" className="data-[state=active]:bg-white/20">
            <History className="h-4 w-4 mr-2" />
            {t("admin.inventoryMovements")}
          </TabsTrigger>
          <TabsTrigger value="alerts" className="data-[state=active]:bg-white/20">
            <AlertTriangle className="h-4 w-4 mr-2" />
            {t("admin.inventoryAlerts")}
          </TabsTrigger>
        </TabsList>

        <TabsContent value="inventory">
          <InventoryTable barId={barId} />
        </TabsContent>

        <TabsContent value="recipes">
          <RecipeManager barId={barId} />
        </TabsContent>

        <TabsContent value="movements">
          <InventoryMovements barId={barId} />
        </TabsContent>

        <TabsContent value="alerts">
          <InventoryAlerts barId={barId} />
        </TabsContent>
      </Tabs>
    </div>
  )
}

