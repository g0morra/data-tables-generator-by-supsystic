<?php


class SupsysticTables_Tables_Module extends SupsysticTables_Core_BaseModule
{
    public function onInit()
    {
        parent::onInit();

        $this->registerShortcode();
        $this->registerTwigTableRender();
    }

    /**
     * {@inheritdoc}
     */
    public function afterUiLoaded(SupsysticTables_Ui_Module $ui)
    {
        parent::afterUiLoaded($ui);

        $environment = $this->getEnvironment();
        $hookName = 'admin_enqueue_scripts';
        $dynamicHookName = is_admin() ? $hookName : 'wp_enqueue_scripts';

        $version = $environment->getConfig()->get('plugin_version');
        $cachingAllowed = $environment->isProd();

        $ui->add($ui->createScript('jquery')->setHookName($hookName));
        $ui->add(
            $ui->createStyle('supsystic-tables-datatables-css')
                ->setHookName($dynamicHookName)
                ->setExternalSource('//cdn.datatables.net/1.10.6/css/jquery.dataTables.min.css')
                ->setVersion('1.10.6')
                ->setCachingAllowed(true)
        );

        $ui->add(
            $ui->createScript('supsystic-tables-datatables-js')
                ->setHookName($dynamicHookName)
                ->setExternalSource('//cdn.datatables.net/1.10.6/js/jquery.dataTables.min.js')
                ->setVersion('1.10.6')
                ->setCachingAllowed(true)
                ->addDependency('jquery')
        );

        $ui->add(
            $ui->createScript('supsystic-tables-shortcode')
                ->setHookName($dynamicHookName)
                ->setModuleSource($this, 'js/tables.shortcode.js')
                ->setVersion($version)
                ->setCachingAllowed($cachingAllowed)
                ->addDependency('jquery')
                ->addDependency('supsystic-tables-datatables-js')
        );

        $ui->add(
            $ui->createStyle('supsystic-tables-shortcode-css')
                ->setHookName($dynamicHookName)
                ->setModuleSource($this, 'css/tables.shortcode.css')
                ->setVersion($version)
                ->setCachingAllowed($cachingAllowed)
        );

        /* Backend scripts */
        if ($environment->isModule('tables')) {
            $ui->add(
                $ui->createScript('jquery-ui-dialog')
            );

            $ui->add(
                $ui->createScript('supsystic-tables-tables-model')
                    ->setHookName($hookName)
                    ->setModuleSource($this, 'js/tables.model.js')
                    ->setCachingAllowed($cachingAllowed)
                    ->setVersion($version)
            );

            if ($environment->isAction('index')) {
                $ui->add(
                    $ui->createScript('supsystic-tables-tables-index')
                        ->setHookName($hookName)
                        ->setModuleSource($this, 'js/tables.index.js')
                        ->setCachingAllowed($cachingAllowed)
                        ->setVersion($version)
                        ->addDependency('jquery-ui-dialog')
                );
            }

            if ($environment->isAction('view')) {
                $ui->add(
                    $ui->createStyle('supsystic-tables-tables-editor-css')
                        ->setHookName($hookName)
                        ->setModuleSource($this, 'css/tables.editor.css')
                        ->setCachingAllowed($cachingAllowed)
                        ->setVersion($version)
                );

                /* Toolbar */
                $ui->add(
                    $ui->createStyle('supsystic-tables-toolbar-css')
                        ->setHookName($hookName)
                        ->setModuleSource($this, 'libraries/toolbar/jquery.toolbars.css')
                        ->setCachingAllowed(true)
                );

                $ui->add(
                    $ui->createScript('supsystic-tables-toolbar-js')
                        ->setHookName($hookName)
                        ->setModuleSource($this, 'libraries/toolbar/jquery.toolbar.js')
                        ->setCachingAllowed(true)
                );

                /* Handsontable */
                $ui->add(
                    $ui->createStyle('supsystic-tables-handsontable-css')
                        ->setHookName($hookName)
                        ->setModuleSource($this, 'libraries/handsontable/handsontable.full.min.css')
                        ->setCachingAllowed(true)
                        ->setVersion('0.14.1')
                );

                $ui->add(
                    $ui->createScript('supsystic-tables-handsontable-js')
                        ->setHookName($hookName)
                        ->setModuleSource($this, 'libraries/handsontable/handsontable.full.min.js')
                        ->setCachingAllowed(true)
                        ->setVersion('0.14.1')
                );

                $ui->add(
                    $ui->createScript('supsystic-tables-editor-toolbar-js')
                        ->setHookName($hookName)
                        ->setModuleSource($this, 'js/editor/tables.editor.toolbar.js')
                        ->setCachingAllowed($cachingAllowed)
                        ->setVersion($version)
                );

                $ui->add(
                    $ui->createStyle('supsystic-tables-tables-view')
                        ->setHookName($hookName)
                        ->setModuleSource($this, 'css/tables.view.css')
                        ->setCachingAllowed($cachingAllowed)
                        ->setVersion($version)
                );

                $ui->add(
                    $ui->createScript('supsystic-tables-tables-view')
                        ->setHookName($hookName)
                        ->setModuleSource($this, 'js/tables.view.js')
                        ->setCachingAllowed($cachingAllowed)
                        ->setVersion($version)
                );
            }
        }
    }

    /**
     * Renders the table
     * @param int $id
     * @return string
     */
    public function render($id)
    {
        $environment = $this->getEnvironment();
        $twig = $environment->getTwig();

        /** @var SupsysticTables_Core_Module $core */
        $core = $environment->getModule('core');
        /** @var SupsysticTables_Tables_Model_Tables $tables */
        $tables = $core->getModelsFactory()->get('tables');
        $table = $tables->getById($id);

        if (!$table) {
            return sprintf(
                $environment->translate('The table with ID %d not exists.'),
                $id
            );
        }

        return $twig->render(
            '@tables/shortcode.twig',
            array('table' => $table)
        );
    }

    public function doShortcode($attributes)
    {
        $environment = $this->getEnvironment();
        $config = $environment->getConfig();

        if (!array_key_exists('id', $attributes)) {
            return sprintf($environment->translate(
                'Mandatory attribute "id" is not specified. ' .
                'Shortcode usage example: [%s id="{table_id}"]'
            ), $config->get('shortcode_name'));
        }

        return $this->render((int)$attributes['id']);
    }

    private function registerShortcode()
    {
        $config = $this->getEnvironment()->getConfig();
        $callable = array($this, 'doShortcode');

        add_shortcode(
            $config->get('shortcode_name'),
            $callable
        );
    }

    private function registerTwigTableRender()
    {
        $twig = $this->getEnvironment()->getTwig();
        $callable = array($this, 'render');


        $twig->addFunction(
            new Twig_SimpleFunction(
                'render_table',
                $callable,
                array('is_safe' => array('html'))
            )
        );
    }

}